import {createClient} from '@sanity/client'

const client = createClient({projectId:'0dep7ult',dataset:'production',apiVersion:'2024-01-01',useCdn:false,token:process.env.SANITY_API_READ_TOKEN})

const offers = {