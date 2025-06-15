import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  const { question } = req.body

  if (!question) {
    return res.status(400).json({ message: 'Question is required' })
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001', 
    })

    const result = await model.generateContent(question)
    const response = await result.response
    const text = response.text()

    return res.status(200).json({ answer: text })
  } catch (error: any) {
    console.error('Error generating answer:', error)
    return res.status(500).json({ message: 'Error generating answer', error: error.message })
  }
}
