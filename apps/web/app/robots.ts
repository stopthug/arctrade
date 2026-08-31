import type { MetadataRoute } from "next";
import { PRODUCT_PATH } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [PRODUCT_PATH],
    },
  };
}
