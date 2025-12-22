import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
import uvicorn
import httpx
from bs4 import BeautifulSoup

# OpenTelemetry Setup
resource_attributes = {
    "service.name": os.getenv("RUM_SERVICE", "demo-rum-backend"),
    "service.version": os.getenv("RUM_VERSION", "0.0.8"),
    "deployment.environment": os.getenv("RUM_ENV", "production")
}

provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://o2c-gateway.openobserve-collector.svc:4318/v1/traces")))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

app = FastAPI()

# Database Setup
DATABASE_URL = os.getenv("DB_URL", "postgresql://app:password@cluster-pg-rw.pg-prd.svc:5432/demo-rum")
engine = create_engine(DATABASE_URL)

# HTTP Client with OTel instrumentation
http_client = httpx.AsyncClient(timeout=10.0)

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/load-plugin/{plugin_id}")
async def load_plugin(plugin_id: str):
    with engine.connect() as conn:
        # Real query to the demo-rum database
        result = conn.execute(text("SELECT name, description FROM plugins WHERE id = :id"), {"id": plugin_id})
        plugin = result.fetchone()
        
        if plugin:
            return {"name": plugin[0], "description": plugin[1], "status": "loaded"}
        else:
            return {"error": "Plugin not found", "status": "failed"}

@app.get("/api/hackernews")
async def get_hackernews():
    """Fetch top stories from HackerNews with OTel tracing"""
    try:
        response = await http_client.get("https://news.ycombinator.com/")
        response.raise_for_status()
        
        # Parse HTML to get top stories
        soup = BeautifulSoup(response.text, 'html.parser')
        stories = []
        
        for item in soup.select('.athing')[:10]:  # Get top 10 stories
            title_link = item.select_one('.titleline > a')
            if title_link:
                stories.append({
                    "title": title_link.text,
                    "url": title_link.get('href', ''),
                    "id": item.get('id', '')
                })
        
        return {"stories": stories, "count": len(stories)}
    except Exception as e:
        return {"error": str(e), "stories": []}

@app.get("/api/chucknorris")
async def get_chuck_norris_fact():
    """Fetch a random Chuck Norris fact with OTel tracing"""
    try:
        response = await http_client.get("https://www.chucknorrisfacts.fr/facts/")
        response.raise_for_status()
        
        # Parse HTML to get a fact
        soup = BeautifulSoup(response.text, 'html.parser')
        fact_element = soup.select_one('.fact')
        
        if fact_element:
            fact = fact_element.text.strip()
            return {"fact": fact, "source": "chucknorrisfacts.fr"}
        else:
            return {"error": "Could not find fact", "fact": "Chuck Norris doesn't need facts."}
    except Exception as e:
        return {"error": str(e), "fact": "Chuck Norris broke the API."}

# Mount static files AFTER all API routes
app.mount("/assets", StaticFiles(directory="/usr/share/nginx/html/assets"), name="assets")
app.mount("/src", StaticFiles(directory="/usr/share/nginx/html/src"), name="src")

# Catch-all route for SPA routing - serves index.html for any non-API routes
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve static files or index.html for SPA routing"""
    static_dir = "/usr/share/nginx/html"
    file_path = os.path.join(static_dir, full_path)
    
    # If the file exists, serve it
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise serve index.html for SPA routing
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument(engine=engine)
    HTTPXClientInstrumentor().instrument_client(http_client)
    uvicorn.run(app, host="0.0.0.0", port=8000)
