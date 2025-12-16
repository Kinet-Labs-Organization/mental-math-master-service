export const ThrottlerOption = [
  {
    name: "short",
    ttl: 1000, // 1 second
    limit: process.env.NODE_ENV === "test" ? 1000 : 3, // High limit for tests
  },
  {
    name: "medium",
    ttl: 10000, // 10 seconds
    limit: process.env.NODE_ENV === "test" ? 10000 : 20, // High limit for tests
  },
  {
    name: "long",
    ttl: 60000, // 1 minute
    limit: process.env.NODE_ENV === "test" ? 60000 : 100, // High limit for tests
  },
];
