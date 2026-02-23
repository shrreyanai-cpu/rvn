import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: object;
}

function setMetaTag(attribute: string, value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
}

function removeMetaTag(attribute: string, value: string) {
  const element = document.querySelector(`meta[${attribute}="${value}"]`);
  if (element) {
    element.remove();
  }
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalUrl,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | Ravindrra Vastra Niketan`;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);

    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    if (ogImage) {
      setMetaTag("property", "og:image", ogImage);
      setMetaTag("name", "twitter:image", ogImage);
    }

    let canonicalElement: HTMLLinkElement | null = null;
    if (canonicalUrl) {
      canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalElement) {
        canonicalElement = document.createElement("link");
        canonicalElement.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute("href", canonicalUrl);
    }

    let jsonLdScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      removeMetaTag("name", "description");
      removeMetaTag("name", "keywords");
      removeMetaTag("property", "og:title");
      removeMetaTag("property", "og:description");
      removeMetaTag("property", "og:image");
      removeMetaTag("property", "og:type");
      removeMetaTag("name", "twitter:card");
      removeMetaTag("name", "twitter:title");
      removeMetaTag("name", "twitter:description");
      removeMetaTag("name", "twitter:image");
      if (canonicalElement) {
        canonicalElement.remove();
      }
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, jsonLd]);

  return null;
}
