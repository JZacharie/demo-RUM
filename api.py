import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
import uvicorn

# OpenTelemetry Setup
resource_attributes = {
    "service.name": os.getenv("RUM_SERVICE", "demo-rum-backend"),
    "service.version": os.getenv("RUM_VERSION", "0.0.3"),
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

# Serve static files from the frontend build
app.mount("/", StaticFiles(directory="/usr/share/nginx/html", html=True), name="static")

if __name__ == "__main__":
    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument(engine=engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)
