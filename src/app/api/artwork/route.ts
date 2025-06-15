import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use a fixed number of pages to ensure consistent results
    const totalPages = 100
    const page = Math.floor(Math.random() * totalPages)
    
    const response = await fetch(
      'https://api.artic.edu/api/v1/artworks?' + 
      'fields=id,title,artist_display,image_id,date_display,medium_display' +
      '&limit=1' +
      '&is_on_view=true' +
      '&has_not_been_viewed_much=false' +
      `&page=${page}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch artwork')
    }
    
    const data = await response.json()
    const artwork = data.data[0]
    
    if (!artwork || !artwork.image_id) {
      throw new Error('No artwork found')
    }

    return NextResponse.json({
      title: artwork.title,
      artist: artwork.artist_display,
      date: artwork.date_display,
      medium: artwork.medium_display,
      url: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/390,/0/default.jpg`
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
} 