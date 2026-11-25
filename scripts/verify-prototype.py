from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "playwright"
URL = "http://127.0.0.1:5173/"
APP_PORT = urlsplit(URL).port
HOME = "Apa yang ingin Anda periksa?"
REPORT = "Hasil pemeriksaan"
CONSENT = "Saya menyetujui cakupan cek eksternal dalam simulasi ini."


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def nav(page, name):
    page.get_by_role("navigation", name="Navigasi utama").get_by_role("button", name=name).click()


def heading(page, name):
    expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()


def select_fixture(page, fixture):
    nav(page, "Cek baru")
    page.get_by_role("combobox", name="Pilih contoh simulasi").select_option(fixture)
    button(page, "Tinjau pemeriksaan").click()


def approve(page):
    expect(button(page, "Mulai simulasi")).to_be_disabled()
    page.get_by_label(CONSENT, exact=True).check()


def finish(page, verdict):
    heading(page, REPORT)
    expect(page.locator("#verdict-heading")).to_have_text(verdict)


def start(page, verdict, external=True):
    if external:
        approve(page)
    button(page, "Mulai simulasi").click()
    finish(page, verdict)


def check_layout(page):
    assert page.evaluate("document.documentElement.scrollWidth") <= page.viewport_size["width"], "Horizontal overflow"
    assert page.evaluate("[...document.fonts].some(font => font.family === 'DM Sans' && font.status === 'loaded')"), "DM Sans did not load"


def check_home_art(page):
    expect(page.locator(".home-art")).to_have_attribute("aria-hidden", "true")
    image_selector = ".home-art img"
    image = page.locator(image_selector)
    page.wait_for_function(
        "selector => document.querySelector(selector)?.naturalWidth > 0",
        arg=image_selector,
    )
    expect(image).to_have_css("animation-name", "none")

    page.emulate_media(reduced_motion="no-preference")
    try:
        expect(image).not_to_have_css("animation-name", "none")
    finally:
        page.emulate_media(reduced_motion="reduce")


def screenshot(page, name, full=False):
    page.evaluate("window.scrollTo(0, 0)")
    check_layout(page)
    page.screenshot(path=OUTPUT / name, full_page=full, animations="disabled")


def upload_from_button(page, file):
    with page.expect_file_chooser() as selection:
        button(page, "Pilih file").click()
    selection.value.set_files(file)


def capture_and_check(page, device, width):
    page.goto(URL)
    heading(page, HOME)
    expect(page.locator(".header-inner .demo-badge")).to_have_text("DEMO/SIMULASI")
    page.evaluate("document.fonts.ready")
    check_home_art(page)
    screenshot(page, f"{device}-home-{width}.png", full=True)

    if device == "desktop":
        page.keyboard.press("Tab")
        expect(page.get_by_role("link", name="Lewati ke konten")).to_be_focused()
        page.keyboard.press("Enter")
        page.keyboard.press("Tab")
        expect(page.get_by_label("Pesan, tautan, atau SHA-256")).to_be_focused()
        select_fixture(page, "scam_screenshot")
        field = page.get_by_label("Teks hasil ekstraksi simulasi")
        expect(button(page, "Periksa dan koreksi teks hasil OCR")).to_be_disabled()
        field.fill(field.input_value().replace("deposlt", "deposit"))
        button(page, "Periksa dan koreksi teks hasil OCR").focus()
        page.keyboard.press("Enter")
        expect(page.get_by_text("Hasil dikonfirmasi", exact=True)).to_be_visible()
        verdict = "Mencurigakan"
    elif device == "tablet":
        button(page, "Tautan & QR").click()
        expect(page.get_by_label("Pesan, tautan, atau SHA-256")).to_be_focused()
        upload_from_button(page, ROOT / "public/contoh/qr-demo.png")
        button(page, "Tinjau pemeriksaan").click()
        button(page, "Konfirmasi tautan dari QR").click()
        verdict = "Berbahaya"
    else:
        upload_from_button(page, ROOT / "public/contoh/lampiran-demo.txt")
        button(page, "Tinjau pemeriksaan").click()
        verdict = "Berbahaya"

    heading(page, "Tinjau pemeriksaan")
    expect(page.get_by_role("heading", name="Persetujuan cek eksternal")).to_be_visible()
    screenshot(page, f"{device}-tinjau-{width}.png", full=True)
    start(page, verdict)
    if device == "mobile":
        expect(page.get_by_text("Pemeriksaan sebagian", exact=True)).to_be_visible()
        expect(button(page, "Ulangi cek yang gagal")).to_be_enabled()
    if device == "desktop":
        expect(page.get_by_text("Tanpa catatan", exact=True)).to_be_visible()
    screenshot(page, f"{device}-hasil-{width}.png")

    summary = page.locator(".evidence-panel summary")
    summary.focus()
    summary.press("Enter")
    expect(page.locator(".evidence-panel")).to_have_attribute("open", "")
    expect(page.locator(".evidence-item").first).to_be_visible()
    check_layout(page)

    if device == "desktop":
        screenshot(page, "desktop-bukti-1440.png", full=True)
        button(page, "Tambah bahan").click()
        heading(page, "Tinjau bahan tambahan")
        button(page, "Konfirmasi tautan dari QR").click()
        start(page, "Berbahaya")
        expect(page.get_by_text("lowongan[.]example", exact=True)).to_be_visible()
        expect(page.get_by_text("verifikasi[.]example", exact=True)).to_be_visible()
    elif device == "mobile":
        button(page, "Ulangi cek yang gagal").click()
        finish(page, "Berbahaya")
        expect(page.locator(".verdict-band").get_by_text("Pemeriksaan selesai", exact=True)).to_be_visible()

    nav(page, "Riwayat")
    expect(page.locator(".history-row")).to_have_count(1)
    if device == "desktop":
        screenshot(page, "desktop-riwayat-1440.png")
    button(page, "Buka hasil").click()
    heading(page, REPORT)
    nav(page, "Riwayat")
    button(page, "Hapus entri").click()
    heading(page, "Belum ada pemeriksaan di sesi ini.")

    select_fixture(page, "file_too_large")
    expect(page.get_by_role("alert")).to_contain_text("File melebihi batas 5 MB")
    screenshot(page, f"{device}-validasi-{width}.png", full=True)
    print(f"PASS {device} {width}px: input, persetujuan, hasil/bukti, riwayat, validasi, tanpa overflow", flush=True)


def other_scenarios(page):
    page.goto(URL)
    button(page, "Tinjau pemeriksaan").click()
    expect(page.get_by_role("alert")).to_contain_text("Masukkan pesan")
    select_fixture(page, "unsupported_type")
    expect(page.get_by_role("alert")).to_contain_text("Format file belum didukung")

    nav(page, "Cek baru")
    textarea = page.get_by_label("Pesan, tautan, atau SHA-256")
    textarea.fill("https://tidak-dikenal.example/input")
    button(page, "Tinjau pemeriksaan").click()
    expect(page.get_by_role("alert")).to_contain_text("belum punya hasil simulasi")

    nav(page, "Cek baru")
    textarea.fill("https://kampus.example/pengumuman")
    button(page, "Tinjau pemeriksaan").click()
    button(page, "Lanjutkan tanpa cek eksternal").click()
    finish(page, "Belum dapat disimpulkan")
    expect(page.get_by_text("Dilewati karena izin belum diberikan.", exact=True)).to_be_visible()
    select_fixture(page, "benign_url")
    page.get_by_label("Identifikasi domain lokal", exact=True).check()
    start(page, "Tidak ada indikasi terdeteksi")
    expect(page.get_by_text("Identifikasi domain lokal", exact=True)).to_be_visible()

    select_fixture(page, "scam_message")
    start(page, "Mencurigakan", external=False)
    select_fixture(page, "unknown_timeout")
    start(page, "Belum dapat disimpulkan")
    button(page, "Ulangi cek yang gagal").click()
    finish(page, "Belum dapat disimpulkan")

    select_fixture(page, "loading_and_errors")
    approve(page)
    button(page, "Mulai simulasi").click()
    heading(page, "Simulasi pemeriksaan")
    button(page, "Batalkan").click()
    heading(page, "Tinjau pemeriksaan")
    expect(page.get_by_role("status").filter(has_text="Simulasi dibatalkan.")).to_have_count(1)
    button(page, "Mulai simulasi").click()
    expect(page.get_by_text("Sedang memeriksa", exact=True).first).to_be_visible()
    screenshot(page, "desktop-progres-1440.png")
    finish(page, "Belum dapat disimpulkan")
    expect(page.locator(".verdict-band").get_by_text("Batas pemeriksaan tercapai", exact=True)).to_be_visible()
    expect(button(page, "Ulangi cek yang gagal")).to_be_disabled()
    expect(button(page, "Ulangi cek yang gagal")).to_be_enabled()
    button(page, "Ulangi cek yang gagal").click()
    finish(page, "Tidak ada indikasi terdeteksi")
    nav(page, "Riwayat")
    expect(page.get_by_role("heading", name="Antrean dan batas pemeriksaan", exact=True)).to_have_count(1)

    select_fixture(page, "apk_indicators")
    start(page, "Mencurigakan", external=False)
    expect(page.locator(".result-intro")).to_contain_text("Pratinjau P1")
    select_fixture(page, "synthetic_image")
    start(page, "Keamanan belum dinilai", external=False)
    expect(page.get_by_text("Kemungkinan dibuat AI", exact=True)).to_be_visible()
    page.reload()
    nav(page, "Riwayat")
    heading(page, "Belum ada pemeriksaan di sesi ini.")
    print("PASS fixture lain: pesan, tautan, hash, izin ditolak, OCR, batas kuota, batal/retry, pratinjau P1, reset", flush=True)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    errors = []
    external = []

    def local_request(route):
        target = urlsplit(route.request.url)
        if target.hostname == "127.0.0.1" and target.port == APP_PORT:
            route.continue_()
        else:
            external.append(route.request.url)
            route.abort()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        print(f"Chromium {browser.version}", flush=True)
        for name, width, height in (("desktop", 1440, 900), ("tablet", 768, 1024), ("mobile", 390, 844)):
            context = browser.new_context(
                viewport={"width": width, "height": height}, reduced_motion="reduce",
                is_mobile=name == "mobile", has_touch=name != "desktop",
            )
            context.route("**/*", local_request)
            page = context.new_page()
            page.set_default_timeout(6500)
            page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
            page.on("pageerror", lambda error: errors.append(str(error)))
            capture_and_check(page, name, width)
            if name == "desktop":
                other_scenarios(page)
            context.close()
        browser.close()

    assert not errors, errors
    assert not external, external
    print("PASS konsol: 0 error | HTTP eksternal: 0 permintaan", flush=True)


if __name__ == "__main__":
    main()
