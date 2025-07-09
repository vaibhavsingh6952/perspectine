import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getBlogPost } from "@/lib/posts";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="blog-post-container">
      <Link href="/" className="back-link">
        ← Back to Articles
      </Link>
      <article className="blog-article">
        <header className="article-header">
          <div className="article-meta">
            <span>{post.date}</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
        </header>
        <div className="article-content">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.6",
                    marginBottom: "1rem",
                  }}
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="text-wrap"
                  style={{
                    backgroundColor: "#081d0f",
                    padding: "0.2rem 0.4rem",
                    borderRadius: "4px",
                    textWrap: "wrap",
                    width: "100%",
                    display: "block",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
