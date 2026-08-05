import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgyrxqxhroulnrrxpibe.supabase.co'
const supabaseAnonKey = 'sb_publishable_WDrW30qUWsLnnKNe5OHr2A_Jzljgh5i'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectAll() {
  const { data, error } = await supabase
    .from('pg_listings')
    .select('id, name, state, city, area')

  if (error) {
    console.error(error)
    return
  }

  console.log(`Total listings: ${data.length}`)
  console.log(data)
}

inspectAll()
