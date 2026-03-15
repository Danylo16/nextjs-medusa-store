import { notFound } from "next/navigation"
import { getPostBySlug } from "@lib/data/strapi"
import PostSections from "@modules/blog/components/strapi/post-sections"
import StrapiBlocks from "@modules/blog/components/strapi/strapi-blocks"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: "Блог" }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) return notFound()

  const hasSections = Array.isArray(post.sections) && post.sections.length > 0

  return (
    <div className="content-container py-10">
      <article className="mx-auto max-w-[820px]">
        <header>
          <h1 className="text-3xl font-semibold leading-tight">{post.title}</h1>

          {post.excerpt ? (
            <p className="mt-4 text-base text-foreground/80">{post.excerpt}</p>
          ) : null}

          {post.cover?.url ? (
            <div className="mt-8 overflow-hidden rounded-2xl bg-black/5">
              <div className="relative w-full aspect-[16/9]">
                <img
                  src={post.cover.url}
                  alt={post.cover.alternativeText || post.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          ) : null}
        </header>

        {post.content ? (
 	 <div className="mt-10">
   	  <StrapiBlocks content={post.content} />
 	 </div>
        ) : null}

{hasSections ? <PostSections sections={post.sections!} /> : null}
      </article>
    </div>
  )
}
