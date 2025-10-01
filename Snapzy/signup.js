import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Setup Resend (or SendGrid)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const { name, email, password } = req.body;

  if(!email || !password || !name) return res.status(400).json({error:'Missing fields'});

  // Hash password
  const hashed = await bcrypt.hash(password,10);

  // Save to Supabase
  const { data, error } = await supabase.from('users').insert([
    { name, email, password:hashed, verified:false }
  ]);

  if(error) return res.status(500).json({error:error.message});

  // Send verification email
  await resend.emails.send({
    from: 'no-reply@yourdomain.com',
    to: email,
    subject: 'Verify your ISO account',
    html: `<p>Click <a href="https://iso-messenger-c9cj.vercel.app/api/verify?email=${encodeURIComponent(email)}">here</a> to verify your account.</p>`
  });

  return res.status(200).json({success:true});
};
