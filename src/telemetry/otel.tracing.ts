import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Logger } from "@nestjs/common";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "https://otlp.uptrace.dev/v1/traces",
    headers: {
      "uptrace-dsn": "https://SxK5BoAwO-voBu1OEoifrw@api.uptrace.dev?grpc=4317",
    },
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

if (process.env.ENV === "production") {
  sdk.start();
  Logger.log("🚀 OpenTelemetry initialized");
}
