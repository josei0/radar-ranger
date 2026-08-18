const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://hdqbmuwrgdisryonsmkh.supabase.co', 'sb_publishable_cXLZiNTkJRF0OFDuHYxS6A_6gQpkjLB');

async function main() {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, category, game_type, game_data')
    .eq('category', 'sd_4_6');
  
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
