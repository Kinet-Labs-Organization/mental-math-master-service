export const CORSOption = {
  origin: process.env.CORS_ORIGIN?.split(","),
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
