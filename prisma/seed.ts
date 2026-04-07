import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Shipyard database…");

  // --- Creators ---
  const alex = await prisma.user.upsert({
    where: { email: "alex@shipyard.ai" },
    update: {},
    create: {
      email: "alex@shipyard.ai",
      name: "Alex Chen",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      bio: "AI developer & productivity enthusiast. Building tools that save hours.",
      is_verified: true,
      total_earned: 4230.5,
      withdrawn: 2500,
    },
  });

  const maya = await prisma.user.upsert({
    where: { email: "maya@shipyard.ai" },
    update: {},
    create: {
      email: "maya@shipyard.ai",
      name: "Maya Patel",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
      bio: "Content strategist turned AI builder. I make agents that write.",
      is_verified: true,
      total_earned: 2140.0,
      withdrawn: 1000,
    },
  });

  const jordan = await prisma.user.upsert({
    where: { email: "jordan@shipyard.ai" },
    update: {},
    create: {
      email: "jordan@shipyard.ai",
      name: "Jordan Rivers",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
      bio: "Full-stack dev obsessed with automation.",
      is_verified: false,
      total_earned: 890.0,
      withdrawn: 0,
    },
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara@shipyard.ai" },
    update: {},
    create: {
      email: "sara@shipyard.ai",
      name: "Sara Kim",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
      bio: "Marketer who discovered AI agents change everything.",
      is_verified: true,
      total_earned: 3150.0,
      withdrawn: 1500,
    },
  });

  // --- Agents ---
  const agents = [
    {
      name: "Blog Post Generator",
      description: "Generate SEO-optimized blog posts in your brand voice. Provide a topic and keywords, and get a full 800-1200 word post with headings, meta description, and CTA.",
      category: "Content",
      tags: ["writing", "seo", "blog", "marketing"],
      prompt: "Write a comprehensive, SEO-optimized blog post about {{topic}}.\n\nTarget keywords: {{keywords}}\nTone: {{tone}}\nWord count: 800-1200 words\n\nInclude:\n- Engaging headline\n- Introduction with hook\n- 3-5 main sections with H2 subheadings\n- Practical examples\n- Conclusion with CTA\n- Meta description (155 chars)\n\nFormat in Markdown.",
      parameters: JSON.stringify([
        { name: "topic", type: "text", label: "Blog Topic", helpText: "What should the post be about?", required: true },
        { name: "keywords", type: "text", label: "Target Keywords", helpText: "Comma-separated SEO keywords", required: true },
        { name: "tone", type: "select", label: "Writing Tone", options: ["Professional", "Conversational", "Educational", "Persuasive"], required: false, defaultValue: "Professional" },
      ]),
      default_model: "ollama",
      rating: 4.8,
      usage_count: 2847,
      creator_id: maya.id,
    },
    {
      name: "Code Reviewer",
      description: "Get instant code reviews with bug detection, security analysis, and improvement suggestions. Supports JavaScript, TypeScript, Python, Go, and Rust.",
      category: "Code",
      tags: ["code", "review", "debugging", "security"],
      prompt: "Review the following {{language}} code and provide detailed feedback:\n\n```{{language}}\n{{code}}\n```\n\nAnalyze for:\n1. Bugs and logical errors\n2. Security vulnerabilities\n3. Performance issues\n4. Code style and best practices\n5. Suggested improvements with examples\n\nFormat your response with clear sections and code examples.",
      parameters: JSON.stringify([
        { name: "code", type: "textarea", label: "Code to Review", helpText: "Paste your code here", required: true },
        { name: "language", type: "select", label: "Language", options: ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java"], required: true, defaultValue: "TypeScript" },
      ]),
      default_model: "claude",
      rating: 4.9,
      usage_count: 5231,
      creator_id: alex.id,
    },
    {
      name: "Email Drafter",
      description: "Write professional emails in seconds. From cold outreach to follow-ups, internal memos to client updates — perfectly tuned to your situation.",
      category: "Workflows",
      tags: ["email", "writing", "communication", "productivity"],
      prompt: "Draft a professional email with the following details:\n\nPurpose: {{purpose}}\nRecipient: {{recipient}}\nKey points: {{key_points}}\nTone: {{tone}}\n\nMake it concise, clear, and action-oriented. Include a clear subject line.\n\nFormat:\nSubject: [subject]\n\n[email body]",
      parameters: JSON.stringify([
        { name: "purpose", type: "text", label: "Email Purpose", helpText: "What is this email for?", required: true },
        { name: "recipient", type: "text", label: "Who is it to?", helpText: "e.g. 'my manager', 'a potential client'", required: true },
        { name: "key_points", type: "textarea", label: "Key Points", helpText: "What needs to be communicated?", required: true },
        { name: "tone", type: "select", label: "Tone", options: ["Formal", "Friendly", "Assertive", "Apologetic"], required: false, defaultValue: "Formal" },
      ]),
      default_model: "ollama",
      rating: 4.6,
      usage_count: 3912,
      creator_id: maya.id,
    },
    {
      name: "SQL Query Builder",
      description: "Generate optimized SQL queries from plain English. Describe what data you need and get production-ready SQL with explanations.",
      category: "Code",
      tags: ["sql", "database", "queries", "data"],
      prompt: "Generate a SQL query for the following request:\n\nDatabase type: {{db_type}}\nTable schema: {{schema}}\nRequest: {{request}}\n\nProvide:\n1. The SQL query (formatted and readable)\n2. Explanation of what it does\n3. Any indexes that would improve performance\n4. Edge cases to watch out for",
      parameters: JSON.stringify([
        { name: "request", type: "textarea", label: "What data do you need?", helpText: "Describe in plain English", required: true },
        { name: "schema", type: "textarea", label: "Table Schema", helpText: "Paste CREATE TABLE statements or describe your tables", required: true },
        { name: "db_type", type: "select", label: "Database", options: ["PostgreSQL", "MySQL", "SQLite", "SQL Server", "BigQuery"], required: false, defaultValue: "PostgreSQL" },
      ]),
      default_model: "claude",
      rating: 4.7,
      usage_count: 1834,
      creator_id: alex.id,
    },
    {
      name: "Product Description Writer",
      description: "Write compelling product descriptions that convert. Optimized for e-commerce with SEO keywords and benefit-driven copy.",
      category: "Marketing",
      tags: ["ecommerce", "copywriting", "product", "seo"],
      prompt: "Write a compelling product description for:\n\nProduct: {{product_name}}\nKey features: {{features}}\nTarget audience: {{audience}}\nPrice point: {{price_point}}\n\nCreate:\n1. Headline (benefit-focused)\n2. Short description (50 words)\n3. Full description (150-200 words)\n4. 5 bullet points of key features\n5. SEO meta description (155 chars)\n\nFocus on benefits over features. Use power words.",
      parameters: JSON.stringify([
        { name: "product_name", type: "text", label: "Product Name", required: true },
        { name: "features", type: "textarea", label: "Key Features", helpText: "List the main features/specs", required: true },
        { name: "audience", type: "text", label: "Target Audience", helpText: "Who is this for?", required: true },
        { name: "price_point", type: "select", label: "Price Point", options: ["Budget", "Mid-range", "Premium", "Luxury"], required: false, defaultValue: "Mid-range" },
      ]),
      default_model: "ollama",
      rating: 4.5,
      usage_count: 1245,
      creator_id: sara.id,
    },
    {
      name: "Meeting Summarizer",
      description: "Transform meeting transcripts into structured summaries with action items, decisions, and follow-ups. Never lose track of what was agreed.",
      category: "Workflows",
      tags: ["meetings", "productivity", "summarization", "teams"],
      prompt: "Summarize the following meeting transcript:\n\n{{transcript}}\n\nProvide a structured summary including:\n\n## Meeting Summary\n[2-3 sentence overview]\n\n## Key Decisions\n[Bullet list of decisions made]\n\n## Action Items\n[Table: Task | Owner | Due Date]\n\n## Discussion Points\n[Main topics discussed]\n\n## Next Steps\n[What happens next]",
      parameters: JSON.stringify([
        { name: "transcript", type: "textarea", label: "Meeting Transcript", helpText: "Paste the transcript or notes", required: true },
      ]),
      default_model: "claude",
      rating: 4.8,
      usage_count: 892,
      creator_id: alex.id,
    },
    {
      name: "Resume Analyzer",
      description: "Get AI-powered resume feedback with specific improvements for your target role. ATS optimization, keyword analysis, and scoring included.",
      category: "Workflows",
      tags: ["resume", "career", "job-search", "ats"],
      prompt: "Analyze this resume for the role of {{target_role}}:\n\n{{resume}}\n\nProvide:\n1. Overall score (out of 100) with breakdown\n2. ATS compatibility analysis\n3. Missing keywords for the role\n4. Top 5 improvements to make\n5. Rewritten bullet points for the weakest section\n6. Summary assessment",
      parameters: JSON.stringify([
        { name: "resume", type: "textarea", label: "Resume Content", helpText: "Paste your resume text", required: true },
        { name: "target_role", type: "text", label: "Target Job Title", helpText: "e.g. Senior Software Engineer", required: true },
      ]),
      default_model: "claude",
      rating: 4.7,
      usage_count: 2103,
      creator_id: jordan.id,
    },
    {
      name: "Social Media Caption Writer",
      description: "Generate engaging captions for Instagram, LinkedIn, Twitter/X, and TikTok. With hashtag suggestions and platform-specific formatting.",
      category: "Marketing",
      tags: ["social-media", "instagram", "linkedin", "copywriting"],
      prompt: "Write social media captions for {{platform}} about:\n\nTopic: {{topic}}\nBrand voice: {{brand_voice}}\nGoal: {{goal}}\n\nCreate 3 caption variations:\n1. Short and punchy (under 100 chars)\n2. Standard length with story\n3. Long-form with value\n\nInclude relevant hashtags (10-15 for Instagram, 3-5 for LinkedIn/Twitter).\nAdd a clear CTA to each.",
      parameters: JSON.stringify([
        { name: "topic", type: "text", label: "Post Topic", required: true },
        { name: "platform", type: "select", label: "Platform", options: ["Instagram", "LinkedIn", "Twitter/X", "TikTok", "Facebook"], required: true, defaultValue: "Instagram" },
        { name: "brand_voice", type: "select", label: "Brand Voice", options: ["Professional", "Playful", "Educational", "Inspirational", "Bold"], required: false, defaultValue: "Professional" },
        { name: "goal", type: "select", label: "Post Goal", options: ["Engagement", "Sales", "Awareness", "Education", "Community"], required: false, defaultValue: "Engagement" },
      ]),
      default_model: "ollama",
      rating: 4.4,
      usage_count: 3421,
      creator_id: sara.id,
    },
    {
      name: "API Documentation Generator",
      description: "Generate complete, professional API docs from your code or endpoint descriptions. OpenAPI spec, usage examples, and error codes included.",
      category: "Code",
      tags: ["api", "documentation", "openapi", "developer-tools"],
      prompt: "Generate comprehensive API documentation for:\n\n{{endpoint_description}}\n\nInclude:\n1. Endpoint overview\n2. Request format (method, URL, headers, body)\n3. Response format with field descriptions\n4. Error codes and meanings\n5. Code examples in JavaScript and Python\n6. OpenAPI 3.0 spec snippet\n7. Rate limiting notes (if applicable)",
      parameters: JSON.stringify([
        { name: "endpoint_description", type: "textarea", label: "Endpoint Description", helpText: "Describe what your API endpoint does, its inputs and outputs", required: true },
      ]),
      default_model: "claude",
      rating: 4.6,
      usage_count: 734,
      creator_id: alex.id,
    },
    {
      name: "Landing Page Copywriter",
      description: "Write high-converting landing page copy. Headlines, sub-headers, feature sections, social proof, and CTAs — all optimized for conversions.",
      category: "Marketing",
      tags: ["landing-page", "copywriting", "conversion", "marketing"],
      prompt: "Write landing page copy for:\n\nProduct/Service: {{product}}\nTarget audience: {{audience}}\nMain benefit: {{main_benefit}}\nPrice: {{price}}\n\nCreate:\n1. Hero headline (5-8 words, benefit-focused)\n2. Hero subheadline (20-30 words)\n3. 3 feature sections (heading + 2 sentences each)\n4. Social proof section (2-3 testimonial templates)\n5. FAQ section (5 questions + answers)\n6. CTA section with urgency\n\nUse proven copywriting frameworks (AIDA, PAS).",
      parameters: JSON.stringify([
        { name: "product", type: "text", label: "Product/Service Name", required: true },
        { name: "audience", type: "text", label: "Target Audience", required: true },
        { name: "main_benefit", type: "text", label: "Main Benefit", helpText: "The #1 problem you solve", required: true },
        { name: "price", type: "text", label: "Price", helpText: "e.g. '$29/month' or 'Free'", required: false },
      ]),
      default_model: "ollama",
      rating: 4.5,
      usage_count: 1567,
      creator_id: sara.id,
    },
    {
      name: "Data Analysis Assistant",
      description: "Analyze your data, identify patterns, and generate insights. Paste CSV data or describe your dataset to get statistical summaries and visualizations.",
      category: "Data",
      tags: ["data", "analytics", "statistics", "visualization"],
      prompt: "Analyze the following data:\n\n{{data}}\n\nAnalysis goal: {{goal}}\n\nProvide:\n1. Data overview (rows, columns, data types)\n2. Key statistics (mean, median, distribution)\n3. Notable patterns and trends\n4. Outliers or anomalies\n5. Top 3 insights\n6. Recommended visualizations (chart types and what to plot)\n7. Suggested next steps for deeper analysis",
      parameters: JSON.stringify([
        { name: "data", type: "textarea", label: "Your Data", helpText: "Paste CSV, JSON, or describe your data", required: true },
        { name: "goal", type: "text", label: "Analysis Goal", helpText: "What question are you trying to answer?", required: true },
      ]),
      default_model: "claude",
      rating: 4.7,
      usage_count: 1089,
      creator_id: jordan.id,
    },
    {
      name: "Customer Support Reply Generator",
      description: "Draft professional, empathetic customer support responses. Handles complaints, refunds, technical issues, and general inquiries with brand-consistent tone.",
      category: "Workflows",
      tags: ["customer-support", "email", "crm", "service"],
      prompt: "Draft a customer support reply for:\n\nCustomer message: {{customer_message}}\nIssue type: {{issue_type}}\nResolution available: {{resolution}}\nBrand tone: {{tone}}\n\nCreate a response that:\n1. Acknowledges the customer's feelings\n2. Apologizes if appropriate\n3. Clearly explains the resolution\n4. Sets expectations for next steps\n5. Ends with a positive note\n\nKeep it under 150 words. Be human, not robotic.",
      parameters: JSON.stringify([
        { name: "customer_message", type: "textarea", label: "Customer Message", required: true },
        { name: "issue_type", type: "select", label: "Issue Type", options: ["Refund Request", "Technical Issue", "Shipping Problem", "Product Question", "Complaint", "General Inquiry"], required: true },
        { name: "resolution", type: "text", label: "Resolution to Offer", helpText: "What can you do for the customer?", required: true },
        { name: "tone", type: "select", label: "Brand Tone", options: ["Warm & Friendly", "Professional", "Casual", "Formal"], required: false, defaultValue: "Warm & Friendly" },
      ]),
      default_model: "ollama",
      rating: 4.6,
      usage_count: 2234,
      creator_id: maya.id,
    },
  ];

  for (const agentData of agents) {
    await prisma.agent.upsert({
      where: { id: agentData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
      update: {
        rating: agentData.rating,
        usage_count: agentData.usage_count,
      },
      create: {
        id: agentData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        ...agentData,
        parameters: agentData.parameters as unknown as object,
      },
    });
    console.log(`  ✓ ${agentData.name}`);
  }

  console.log(`\n✅ Seeded ${agents.length} agents and 4 creators`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
