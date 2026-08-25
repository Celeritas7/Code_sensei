#!/usr/bin/env python3
"""Generate micro-steps for Code Sensei lessons -> lesson_steps.csv
Reads module title + line explanations from Supabase (anon key, read-only),
asks Claude to split each module into steps, writes a CSV for Supabase's
Table Editor -> code_sensei_lesson_steps -> Import.

Setup (PowerShell):
    $env:ANTHROPIC_API_KEY="sk-ant-..."
    python generate_lesson_steps.py sql        # one topic
    python generate_lesson_steps.py            # sql + bat
(no pip installs beyond requests — the anthropic SDK is NOT used)
"""
import csv, json, os, sys, requests

SB = "https://wylxvmkcrexwfpjpbhyy.supabase.co/rest/v1"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHh2bWtjcmV4d2ZwanBiaHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzkxMDYsImV4cCI6MjA4NDIxNTEwNn0.6Bxo42hx4jwlJGWnfjiTpiDUsYfc1QLTN3YtrU1efak"  # same anon key as index.html (const K='eyJ...')
HDR = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
MODEL = "claude-sonnet-4-5"

def ask_claude(prompt):
    r = requests.post("https://api.anthropic.com/v1/messages",
        headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"],
                 "anthropic-version": "2023-06-01",
                 "content-type": "application/json",
                 "accept-encoding": "identity"},
        json={"model": MODEL, "max_tokens": 4000,
              "messages": [{"role": "user", "content": prompt}]},
        timeout=180)
    if not r.ok:
        print(f"  anthropic -> {r.status_code}: {r.text[:300]}")
        r.raise_for_status()
    return r.json()["content"][0]["text"]

PROMPT = """You are preparing a lesson for a micro-step pager (one concept per screen).
The lesson material below is real code from the student's course, line by line, each
with its explanation. Split it into 4-8 teaching steps. Each step: a short title,
1-3 sentences of markdown body (the app renders **bold** and `code`), and optionally
ONE short code snippet taken from the material. Judge step size yourself: one genuine
concept per step, no filler.
Return ONLY a JSON array: [{{"title": str, "body_md": str, "code_snippet": str|null}}, ...]

MODULE (topic: {topic}, module {module}: {module_title}):
{content}"""

def fetch(table, query):
    r = requests.get(f"{SB}/{table}?{query}", headers=HDR, timeout=30)
    if not r.ok:
        print(f"  {table} -> {r.status_code}: {r.text[:300]}")
        r.raise_for_status()
    return r.json()

def main():
    if "ANTHROPIC_API_KEY" not in os.environ:
        sys.exit('Set the key first:  $env:ANTHROPIC_API_KEY="sk-ant-..."')
    topics = sys.argv[1:] or ["sql", "bat"]
    rows = []
    for topic in topics:
        lessons = fetch("code_sensei_lessons", f"select=*&topic_id=eq.{topic}&order=module_number")
        for les in lessons:
            mnum = les["module_number"]
            title = les.get("module_title") or f"Module {mnum}"
            lines = fetch("code_sensei_line_explanations",
                          f"select=*&topic_id=eq.{topic}&module_number=eq.{mnum}&order=source_filename,line_number")
            if not lines:
                print(f"skip {topic} m{mnum}: no line explanations"); continue
            parts, curfile = [], None
            for l in lines:
                if l.get("source_filename") != curfile:
                    curfile = l.get("source_filename")
                    parts.append(f"\n== FILE: {curfile} ==")
                code = (l.get("code_line") or l.get("line_text") or l.get("code") or "").rstrip()
                expl = (l.get("explanation") or l.get("main_explanation") or "").strip()
                parts.append(f"{code}\n   -> {expl}")
            content = "\n".join(parts)[:12000]
            text = ask_claude(PROMPT.format(
                topic=topic, module=mnum, module_title=title, content=content)).strip()
            text = text[text.find("["):text.rfind("]") + 1]
            steps = json.loads(text)
            for i, s in enumerate(steps, 1):
                rows.append({"topic_id": topic, "module_number": mnum, "step_number": i,
                             "title": s["title"], "body_md": s["body_md"],
                             "code_snippet": s.get("code_snippet") or ""})
            print(f"{topic} m{mnum} ({title}): {len(steps)} steps")
    with open("lesson_steps.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["topic_id", "module_number", "step_number",
                                          "title", "body_md", "code_snippet"])
        w.writeheader(); w.writerows(rows)
    print(f"wrote lesson_steps.csv ({len(rows)} rows)")

if __name__ == "__main__":
    main()
