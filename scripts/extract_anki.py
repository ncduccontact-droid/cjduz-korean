#!/usr/bin/env python3
import zipfile, sqlite3, json, tempfile, os, re, html

ROOT = "/Users/nguyenchiduc/Downloads/한국"
ANKI_DIR = os.path.join(ROOT, "ANKI")
MD_FILE = os.path.join(ROOT, "Tài liệu Tiếng Hàn", "So_Tay_Tu_Vung_So_Cap_1_Bai01-15.md")
OUT_DATA = os.path.join(ROOT, "web", "data")
OUT_MEDIA = os.path.join(ROOT, "web", "media")

os.makedirs(OUT_DATA, exist_ok=True)
os.makedirs(OUT_MEDIA, exist_ok=True)

def extract_sound_filename(raw):
    if not raw:
        return ""
    m = re.search(r'\[sound:([^\]]+)\]', raw)
    if m:
        return m.group(1).strip()
    m2 = re.search(r'src="([^"]+\.mp3)"', raw)
    if m2:
        return m2.group(1).strip()
    return ""

def clean_html(raw):
    if not raw:
        return ""
    text = re.sub(r'<audio[^>]*>.*?</audio>', '', raw, flags=re.S)
    text = re.sub(r'<button[^>]*>.*?</button>', '', text, flags=re.S)
    text = re.sub(r'\[sound:[^\]]+\]', '', text)
    return text.strip()

def strip_tags(raw):
    if not raw:
        return ""
    text = clean_html(raw)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return html.unescape(text).strip()

# 1. Parse Markdown handbook to enrich SC1 pronunciation & liaison notes
md_lookup = {}
if os.path.exists(MD_FILE):
    current_lesson = 0
    current_lesson_title = ""
    with open(MD_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line_s = line.strip()
            m_hdr = re.match(r'^##\s+Bài\s+(\d+)\s*·\s*(.+?)\s*\(', line_s)
            if m_hdr:
                current_lesson = int(m_hdr.group(1))
                current_lesson_title = m_hdr.group(2).strip()
                continue
            if line_s.startswith("|") and "**" in line_s:
                parts = [p.strip() for p in line_s.strip("|").split("|")]
                if len(parts) >= 7:
                    word = re.sub(r'\*\*|`', '', parts[1]).strip()
                    meaning = parts[2].strip()
                    romaja = parts[3].strip('` ').strip()
                    ex_ko = parts[4].strip()
                    ex_vi = parts[5].strip()
                    note = parts[6].strip()
                    md_lookup[(current_lesson, word)] = {
                        "romaja": romaja,
                        "note": note,
                        "lessonTitle": current_lesson_title,
                        "meaningMd": meaning,
                        "exKoMd": ex_ko,
                        "exViMd": ex_vi
                    }
                    if word not in md_lookup:
                        md_lookup[word] = md_lookup[(current_lesson, word)]

def unpack_apkg(apkg_path, extract_audio=True):
    records = []
    extracted_files = set()
    with zipfile.ZipFile(apkg_path, "r") as z:
        names = set(z.namelist())
        media_map = {}
        if "media" in names:
            media_map = json.loads(z.read("media").decode("utf-8"))
        # Reverse lookup: filename -> zip_entry_key
        file_to_zip = {v: k for k, v in media_map.items()}

        db_name = "collection.anki21" if "collection.anki21" in names else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".db") as tf:
            tf.write(z.read(db_name))
            tf.flush()
            conn = sqlite3.connect(tf.name)
            cur = conn.cursor()
            col = cur.execute("SELECT models, decks FROM col").fetchone()
            models = json.loads(col[0])
            decks = json.loads(col[1])
            model_fields = {int(mid): [f["name"] for f in m["flds"]] for mid, m in models.items()}
            deck_names = {int(did): d["name"] for did, d in decks.items()}

            rows = cur.execute("""
                SELECT n.id, n.mid, n.flds, n.tags, MIN(c.did)
                FROM notes n
                LEFT JOIN cards c ON c.nid = n.id
                GROUP BY n.id
                ORDER BY n.id
            """).fetchall()

            for nid, mid, flds_raw, tags, did in rows:
                fnames = model_fields.get(mid, [])
                vals = flds_raw.split("\x1f")
                item = {fnames[i]: vals[i] if i < len(vals) else "" for i in range(len(fnames))}
                item["_nid"] = nid
                item["_tags"] = tags.strip()
                item["_deck"] = deck_names.get(did, "Default")
                records.append(item)
            conn.close()

        if extract_audio:
            for fname, zkey in file_to_zip.items():
                if fname.lower().endswith((".mp3", ".ogg", ".wav", ".m4a")) and zkey in names:
                    out_p = os.path.join(OUT_MEDIA, fname)
                    if not os.path.exists(out_p):
                        with open(out_p, "wb") as out_f:
                            out_f.write(z.read(zkey))
                    extracted_files.add(fname)
    return records, len(extracted_files)

# 2. Extract SC1 Vocabulary (537 words)
sc1_vocab_raw, sc1_v_cnt = unpack_apkg(os.path.join(ANKI_DIR, "Từ vựng", "SC1_Tu_Vung_Tron_Bo_Bai01-15_Kyuri.apkg"))
sc1_vocab = []
lesson_titles = {
    1: "Giới thiệu", 2: "Trường học", 3: "Sinh hoạt hằng ngày", 4: "Ngày và thứ",
    5: "Công việc trong ngày", 6: "Cuối tuần", 7: "Mua sắm", 8: "Thức ăn",
    9: "Nhà cửa", 10: "Gia đình", 11: "Thời tiết", 12: "Điện thoại",
    13: "Sinh nhật", 14: "Sở thích", 15: "Giao thông"
}

for idx, r in enumerate(sc1_vocab_raw, 1):
    deck = r.get("_deck", "")
    m_les = re.search(r'Bài\s*(\d+)', deck) or re.search(r'Bài\s*(\d+)', r.get("Lesson", "")) or re.search(r'Bai(\d+)', r.get("_tags", ""))
    lesson_num = int(m_les.group(1)) if m_les else 1
    word = strip_tags(r.get("Front", ""))
    md_info = md_lookup.get((lesson_num, word)) or md_lookup.get(word, {})
    w_audio = extract_sound_filename(r.get("Audio", ""))
    ex_audio = extract_sound_filename(r.get("ExampleAudio", ""))
    pron = strip_tags(r.get("Pronunciation", "")) or md_info.get("romaja", "")
    extra = strip_tags(r.get("ExtraNotes", ""))
    md_note = md_info.get("note", "")
    merged_note = md_note if (md_note and md_note not in extra) else extra
    if extra and md_note and md_note != extra and extra not in md_note:
        merged_note = f"{md_note} · {extra}"

    sc1_vocab.append({
        "id": f"sc1_v_{idx}",
        "book": "sc1",
        "lesson": lesson_num,
        "lessonTitle": lesson_titles.get(lesson_num, f"Bài {lesson_num}"),
        "korean": word,
        "vietnamese": strip_tags(r.get("VietnameseMeaning", "")) or md_info.get("meaningMd", ""),
        "pronunciation": pron,
        "exampleKo": strip_tags(r.get("ExampleKorean", "")) or md_info.get("exKoMd", ""),
        "exampleVi": strip_tags(r.get("ExampleMeaning", "")) or md_info.get("exViMd", ""),
        "wordAudio": f"media/{w_audio}" if w_audio else "",
        "exampleAudio": f"media/{ex_audio}" if ex_audio else "",
        "note": merged_note
    })

sc1_vocab.sort(key=lambda x: (x["lesson"], int(x["id"].split("_")[-1])))

# 3. Extract SC1 Grammar (51 patterns)
sc1_gram_raw, sc1_g_cnt = unpack_apkg(os.path.join(ANKI_DIR, "Ngữ Pháp", "SC1_Ngu_Phap_Bai01-15_Kyuri.apkg"))
sc1_grammar = []
for idx, r in enumerate(sc1_gram_raw, 1):
    les_str = strip_tags(r.get("Lesson", "1"))
    m_l = re.search(r'(\d+)', les_str)
    lesson_num = int(m_l.group(1)) if m_l else 1
    ex1_a = extract_sound_filename(r.get("ExampleAudio", ""))
    ex2_a = extract_sound_filename(r.get("ExampleAudio2", ""))
    sc1_grammar.append({
        "id": f"sc1_g_{idx}",
        "book": "sc1",
        "lesson": lesson_num,
        "lessonTitle": lesson_titles.get(lesson_num, f"Bài {lesson_num}"),
        "pattern": strip_tags(r.get("GrammarPattern", "")),
        "meaning": strip_tags(r.get("Meaning", "")),
        "construction": strip_tags(r.get("Construction", "")),
        "usage": strip_tags(r.get("Usage", "")),
        "example1Ko": strip_tags(r.get("ExampleKorean", "")),
        "example1Vi": strip_tags(r.get("ExampleMeaning", "")),
        "example1Audio": f"media/{ex1_a}" if ex1_a else "",
        "example2Ko": strip_tags(r.get("ExampleKorean2", "")),
        "example2Vi": strip_tags(r.get("ExampleMeaning2", "")),
        "example2Audio": f"media/{ex2_a}" if ex2_a else "",
        "note": strip_tags(r.get("Notes", ""))
    })
sc1_grammar.sort(key=lambda x: (x["lesson"], int(x["id"].split("_")[-1])))

# 4. Extract Sejong Vocabulary (129 words)
sejong_raw, sj_cnt = unpack_apkg(os.path.join(ANKI_DIR, "Từ vựng", "Sejong_Bai03-04-06-07_Kyuri.apkg"))
sejong_vocab = []
for idx, r in enumerate(sejong_raw, 1):
    deck = r.get("_deck", "")
    m_les = re.search(r'Bài\s*(\d+)', deck) or re.search(r'Bài\s*(\d+)', r.get("Lesson", ""))
    lesson_num = int(m_les.group(1)) if m_les else 3
    w_audio = extract_sound_filename(r.get("Audio", ""))
    ex_audio = extract_sound_filename(r.get("ExampleAudio", ""))
    sejong_vocab.append({
        "id": f"sj_v_{idx}",
        "book": "sejong1",
        "lesson": lesson_num,
        "lessonTitle": strip_tags(r.get("Lesson", deck.split("::")[-1])),
        "korean": strip_tags(r.get("Front", "")),
        "vietnamese": strip_tags(r.get("VietnameseMeaning", "")),
        "pronunciation": strip_tags(r.get("Pronunciation", "")),
        "exampleKo": strip_tags(r.get("ExampleKorean", "")),
        "exampleVi": strip_tags(r.get("ExampleMeaning", "")),
        "wordAudio": f"media/{w_audio}" if w_audio else "",
        "exampleAudio": f"media/{ex_audio}" if ex_audio else "",
        "note": strip_tags(r.get("ExtraNotes", ""))
    })

# 5. Extract TOPIK I Cấp 1-2 (440 items)
topik1_raw, tp1_cnt = unpack_apkg(os.path.join(ANKI_DIR, "TOPIK_I_Cp__12__T_vng__Ng_php_ting_Hn_.apkg"))
topik1_items = []
for idx, r in enumerate(topik1_raw, 1):
    if "Word" in r and r.get("Word"):
        t_audio = extract_sound_filename(r.get("Audio", ""))
        extra_html = r.get("Extra information", "")
        # Extract full sentence and translation from Extra information
        extra_lines = [l.strip() for l in strip_tags(extra_html).split("\n") if l.strip()]
        full_ko = extra_lines[0] if extra_lines else ""
        full_vi = ""
        for l in extra_lines:
            if l.lower().startswith("dịch:"):
                full_vi = l.split(":", 1)[1].strip()
                break
        defn = strip_tags(r.get("Definition", ""))
        # Extract Vietnamese inside parentheses if format is "english (tiếng Việt)"
        m_vi = re.search(r'\(([^)]+)\)', defn)
        vi_short = m_vi.group(1).strip() if m_vi else defn
        topik1_items.append({
            "id": f"tp1_{idx}",
            "book": "topik1",
            "lesson": ((idx - 1) // 30) + 1,
            "lessonTitle": f"Chặng {(idx - 1) // 30 + 1} · Từ vựng & Câu TOPIK I",
            "korean": strip_tags(r.get("Word", "")),
            "vietnamese": vi_short,
            "definitionFull": defn,
            "pronunciation": strip_tags(r.get("Phonetic symbols", "")),
            "cloze": strip_tags(r.get("Cloze", "")),
            "exampleKo": full_ko,
            "exampleVi": full_vi,
            "exampleAudio": f"media/{t_audio}" if t_audio else "",
            "wordAudio": "",
            "note": "\n".join(extra_lines[2:]) if len(extra_lines) > 2 else "",
            "synonyms": strip_tags(r.get("Synonyms", ""))
        })
    elif "Front" in r and r.get("Front"):
        topik1_items.append({
            "id": f"tp1_{idx}",
            "book": "topik1",
            "lesson": ((idx - 1) // 30) + 1,
            "lessonTitle": f"Chặng {(idx - 1) // 30 + 1} · Từ vựng & Câu TOPIK I",
            "korean": strip_tags(r.get("Front", "")),
            "vietnamese": strip_tags(r.get("Back", "")),
            "definitionFull": strip_tags(r.get("Back", "")),
            "pronunciation": "",
            "cloze": "",
            "exampleKo": "",
            "exampleVi": "",
            "exampleAudio": "",
            "wordAudio": "",
            "note": "",
            "synonyms": ""
        })

with open(os.path.join(OUT_DATA, "sc1_vocab.json"), "w", encoding="utf-8") as f:
    json.dump(sc1_vocab, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT_DATA, "sc1_grammar.json"), "w", encoding="utf-8") as f:
    json.dump(sc1_grammar, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT_DATA, "sejong_vocab.json"), "w", encoding="utf-8") as f:
    json.dump(sejong_vocab, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT_DATA, "topik1_bank.json"), "w", encoding="utf-8") as f:
    json.dump(topik1_items, f, ensure_ascii=False, indent=2)

print(f"Extracted successfully:")
print(f"  SC1 Vocab: {len(sc1_vocab)} items (audio files: {sc1_v_cnt})")
print(f"  SC1 Grammar: {len(sc1_grammar)} items (audio files: {sc1_g_cnt})")
print(f"  Sejong Vocab: {len(sejong_vocab)} items (audio files: {sj_cnt})")
print(f"  TOPIK I Bank: {len(topik1_items)} items (audio files: {tp1_cnt})")
print(f"  Total MP3 files in web/media: {len(os.listdir(OUT_MEDIA))}")
