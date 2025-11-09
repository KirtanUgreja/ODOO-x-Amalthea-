import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"
import { type NextRequest, NextResponse } from "next/server"

const DB_PATH = join(process.cwd(), "lib", "db.json")

function readDatabase() {
  if (!existsSync(DB_PATH)) {
    throw new Error("Database file not found")
  }
  return JSON.parse(readFileSync(DB_PATH, "utf-8"))
}

function writeDatabase(data: any) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const db = readDatabase()
    
    // Add timestamp for cache busting
    const response = {
      ...db,
      _timestamp: Date.now()
    }
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Database read error:', error)
    return NextResponse.json(
      { error: "Failed to read database", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json()
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
    }

    const db = readDatabase()
    
    // Merge updates with existing data
    const updatedDb = { ...db, ...updates }
    
    // Validate data structure
    const requiredTables = ['users', 'projects', 'tasks', 'timesheets', 'expenses', 'salesOrders', 'purchaseOrders', 'invoices', 'vendorBills']
    for (const table of requiredTables) {
      if (!Array.isArray(updatedDb[table])) {
        updatedDb[table] = db[table] || []
      }
    }
    
    writeDatabase(updatedDb)

    return NextResponse.json({ 
      success: true, 
      db: updatedDb,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Database write error:', error)
    return NextResponse.json(
      { error: "Failed to update database", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { table, id, data } = await request.json()
    
    if (!table || !id || !data) {
      return NextResponse.json({ error: "Missing required fields: table, id, data" }, { status: 400 })
    }

    const db = readDatabase()
    
    if (!Array.isArray(db[table])) {
      return NextResponse.json({ error: `Table '${table}' not found` }, { status: 404 })
    }

    const itemIndex = db[table].findIndex((item: any) => item.id === id)
    if (itemIndex === -1) {
      return NextResponse.json({ error: `Item with id '${id}' not found in table '${table}'` }, { status: 404 })
    }

    db[table][itemIndex] = { ...db[table][itemIndex], ...data }
    writeDatabase(db)

    return NextResponse.json({ 
      success: true, 
      item: db[table][itemIndex],
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Database update error:', error)
    return NextResponse.json(
      { error: "Failed to update item", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { table, id } = await request.json()
    
    if (!table || !id) {
      return NextResponse.json({ error: "Missing required fields: table, id" }, { status: 400 })
    }

    const db = readDatabase()
    
    if (!Array.isArray(db[table])) {
      return NextResponse.json({ error: `Table '${table}' not found` }, { status: 404 })
    }

    const initialLength = db[table].length
    db[table] = db[table].filter((item: any) => item.id !== id)
    
    if (db[table].length === initialLength) {
      return NextResponse.json({ error: `Item with id '${id}' not found in table '${table}'` }, { status: 404 })
    }

    writeDatabase(db)

    return NextResponse.json({ 
      success: true, 
      deletedId: id,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Database delete error:', error)
    return NextResponse.json(
      { error: "Failed to delete item", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
