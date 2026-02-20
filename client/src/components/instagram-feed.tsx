import { useQuery } from "@tanstack/react-query";
import { SiInstagram } from "react-icons/si";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InstagramPost } from "@shared/schema";

export default function InstagramFeed() {
  const { data: posts, isLoading } = useQuery<InstagramPost[]>({
    queryKey: ["/api/instagram-posts"],
  });

  // Don't render if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 sm:py-24 bg-[#2C3E50] dark:bg-[#1a2530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
            Connect With Us
          </p>
          <h2 
            className="font-serif text-2xl sm:text-3xl font-bold text-white"
            data-testid="text-instagram-heading"
          >
            Follow Us on Instagram
          </h2>
          <p className="text-white/60 text-sm mt-3">
            <span className="text-[#C9A961] font-medium" data-testid="text-instagram-handle">
              @ravindrra_vastra
            </span>
          </p>
        </div>

        {/* Posts Grid - Scrollable on mobile, 3-6 visible */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-md bg-white/10" />
                <Skeleton className="h-3 w-3/4 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {posts?.map((post) => (
              <div
                key={post.id}
                className="flex flex-col"
                data-testid={`card-instagram-post-${post.id}`}
              >
                {/* Image with hover overlay */}
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-instagram-post-${post.id}`}
                  className="group relative overflow-hidden rounded-md aspect-square cursor-pointer mb-3"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption || "Instagram post"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-testid={`img-instagram-post-${post.id}`}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center">
                      <SiInstagram 
                        className="h-8 w-8 text-white mx-auto mb-2"
                        data-testid={`icon-instagram-${post.id}`}
                      />
                      <p 
                        className="text-white text-sm font-medium tracking-wide"
                        data-testid={`text-view-post-${post.id}`}
                      >
                        View Post
                      </p>
                    </div>
                  </div>
                </a>

                {/* Caption below if available */}
                {post.caption && (
                  <p 
                    className="text-white/70 text-xs line-clamp-2 leading-relaxed"
                    data-testid={`text-caption-${post.id}`}
                  >
                    {post.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
