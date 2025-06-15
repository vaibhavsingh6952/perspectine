import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  title: string
  excerpt: string
  date: string
  slug: string
  content: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'src/content/posts')
  const files = fs.readdirSync(postsDirectory)
  
  const posts = files
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        slug: filename.replace('.md', ''),
        content
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

