import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json(
        { message: 'Question is required' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        { message: 'API key not configured' },
        { status: 500 }
      )
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-001' })
      const result = await model.generateContent(question)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({ answer: text })
    } catch (modelError: any) {
      console.error('Gemini API Error:', {
        message: modelError.message,
        details: modelError.details,
        status: modelError.status
      })
      return NextResponse.json(
        { 
          message: 'Error with Gemini API',
          details: modelError.message
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        message: 'Server error',
        details: error.message
      },
      { status: 500 }
    )
  }
} 