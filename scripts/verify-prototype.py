import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "playwright"
URL = "http://127.0.0.1:5173/"
APP_PORT = urlsplit(URL).port
HOME = "Sebelum klik, cek dulu."
REPORT = "Hasil pemeriksaan"
CONSENT = "Saya menyetujui cakupan cek eksternal dalam simulasi ini."
EXAMPLE_CHOOSER = "Pilih contoh simulasi"
HOME_LAYOUT_WRAPPERS = (".example-options .layout-reveal", ".entry-panel .layout-reveal")
INPUT_SELECTION_CUE = ".input-selection-cue"
HOME_MENU_VIEWPORT = '[data-slot="select-viewport"]'
VERDICT_ART_CODES = {
    "Berbahaya": "UNSAFE",
    "Mencurigakan": "SUSPICIOUS",
    "Tidak ada indikasi terdeteksi": "NOT_FLAGGED",
    "Belum dapat disimpulkan": "INCONCLUSIVE",
    "Keamanan belum dinilai": "UNASSESSED",
}


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def nav(page, name):
    page.get_by_role("navigation", name="Navigasi utama").get_by_role("button", name=name).click()


def heading(page, name):
    expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()


def focused_h1(page, name):
    expect(page.get_by_role("heading", level=1, name=name, exact=True)).to_be_focused()


def check_workspace_step(page, active):
    rail = page.get_by_role("list", name="Tahap pemeriksaan", exact=True).and_(
        page.locator("ol.workspace-steps"),
    )
    expect(rail).to_be_visible()
    steps = rail.get_by_role("listitem")
    expect(steps).to_have_count(3)
    for index, label in enumerate(("Tinjau", "Periksa", "Hasil")):
        expect(steps.nth(index).get_by_text(label, exact=True)).to_be_visible()
    current = rail.locator('li[aria-current]:not([aria-current="false"])')
    expect(current).to_have_count(1)
    expect(current).to_have_attribute("aria-current", "step")
    expect(current.get_by_text(active, exact=True)).to_be_visible()
    expect(rail.locator(
        'a[href], button, input, select, textarea, summary, [tabindex], [role="button"], [role="link"]',
    )).to_have_count(0)
    assert rail.get_attribute("tabindex") is None, "Workspace steps must not take focus"


def fixture_option(scope, fixture):
    return scope.get_by_role("option").and_(scope.locator(f'[data-fixture-id="{fixture}"]'))


def expect_fixture_menu_closed(trigger, listbox):
    expect(listbox).to_be_hidden()
    expect(trigger).to_have_attribute("aria-expanded", "false")
    expect(trigger).to_be_focused()


def check_fixture_menu(page, device, width):
    trigger = page.locator("#demo-example")
    expect(page.get_by_role("combobox", name=EXAMPLE_CHOOSER, exact=True)).to_have_attribute("id", "demo-example")
    listbox = page.get_by_role("listbox")
    input_field = page.get_by_label("Pesan, tautan, atau SHA-256")

    trigger.press("Enter")
    expect(listbox).to_be_visible()
    expect(trigger).to_have_attribute("aria-expanded", "true")
    groups = listbox.get_by_role("group")
    expect(groups).to_have_count(3)
    expect(fixture_option(groups.nth(0), "benign_url")).to_be_visible()
    expect(fixture_option(groups.nth(1), "file_too_large")).to_be_visible()
    preview = listbox.get_by_role("group", name="Pratinjau P1", exact=True)
    expect(fixture_option(preview, "apk_indicators")).to_be_visible()
    if device == "mobile":
        screenshot(page, f"{device}-dropdown-{width}.png", target=listbox)

    # The last option must scroll into view when it receives keyboard focus.
    last_option = fixture_option(preview, "synthetic_image")
    page.keyboard.press("End")
    expect(last_option).to_be_focused()
    expect(last_option).to_be_in_viewport()
    page.keyboard.press("ArrowUp")
    expect(fixture_option(preview, "apk_indicators")).to_be_focused()
    page.keyboard.press("Escape")
    expect_fixture_menu_closed(trigger, listbox)
    expect(input_field).to_have_value("")
    page.keyboard.press("Tab")
    expect(input_field).to_be_focused()
    page.keyboard.press("Shift+Tab")
    expect(trigger).to_be_focused()

    page.keyboard.press("Space")
    expect(listbox).to_be_visible()
    page.keyboard.press("Home")
    expect(fixture_option(listbox, "benign_url")).to_be_focused()
    page.keyboard.press("Space")
    expect_fixture_menu_closed(trigger, listbox)
    expect(input_field).to_have_value("https://kampus.example/pengumuman")

    if device == "desktop":
        trigger.click()
        expect(listbox).to_be_visible()
        # Click outside the popup without sending a click to an inert page control.
        page.mouse.click(1, 1)
        expect_fixture_menu_closed(trigger, listbox)
        expect(input_field).to_have_value("https://kampus.example/pengumuman")
        trigger.press("Enter")
        expect(listbox).to_be_visible()
        page.keyboard.press("End")
        expect(listbox.get_by_role("option", name="Kosongkan pilihan", exact=True)).to_be_focused()
        page.keyboard.press("Enter")
        expect_fixture_menu_closed(trigger, listbox)
        expect(input_field).to_have_value("")
    page.keyboard.press("Tab")
    expect(input_field).to_be_focused()


def expect_home_motion(page, action, selectors, *, reduced):
    # Give ResizeObserver and CSS a frame to start the effects before sampling.
    active = page.evaluate("""async ({selectors, wrappers, reduced}) => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return selectors.filter(selector => document.querySelector(selector)?.getAnimations().some(animation => {
            const {activeDuration} = animation.effect.getComputedTiming();
            if (activeDuration <= 1 || (!animation.pending && animation.playState !== 'running')) return false;
            if (reduced || !wrappers.includes(selector)) return true;
            const sizes = animation.effect.getKeyframes().map(frame => frame.blockSize ?? frame.height);
            return new Set(sizes.filter(size => size !== undefined)).size > 1;
        }));
    }""", arg={"selectors": list(selectors), "wrappers": list(HOME_LAYOUT_WRAPPERS), "reduced": reduced})
    expected = [] if reduced else list(selectors)
    assert active == expected, f"{action}: expected active motion on {expected}, got {active}"


def check_home_layout_motion(page, *, reduced):
    mode = "reduce" if reduced else "no-preference"
    page.emulate_media(reduced_motion=mode)
    page.goto(URL)
    page.evaluate("document.fonts.ready")
    trigger = page.locator("#demo-example")
    input_field = page.locator("#check-input")
    listbox = page.locator('[role="listbox"]')
    message_tool = button(page, "Pesan & tangkapan layar")
    link_tool = button(page, "Tautan & QR")
    options = page.locator(".example-options")
    file_detail = options.get_by_text("Lowongan fiktif dengan permintaan deposit.")
    download = options.get_by_role("link", name="Unduh file contoh")
    remove_file = button(page, "Lepas file")
    short_option = fixture_option(listbox, "scam_message")
    file_option = fixture_option(listbox, "scam_screenshot")
    clear_option = listbox.get_by_role("option", name="Kosongkan pilihan", exact=True)
    layout_and_input = (*HOME_LAYOUT_WRAPPERS, INPUT_SELECTION_CUE)
    resizing = page.locator(", ".join(f"{wrapper}[data-resizing]" for wrapper in HOME_LAYOUT_WRAPPERS))
    for wrapper in HOME_LAYOUT_WRAPPERS:
        expect(page.locator(wrapper)).to_have_count(1)

    def open_menu():
        trigger.press("Enter")
        expect(listbox).to_be_visible()

    def focus_option(option, *keys):
        for key in keys:
            page.keyboard.press(key)
        expect(option).to_be_focused()

    def choose(option, *keys):
        open_menu()
        focus_option(option, *keys)
        page.keyboard.press("Enter")

    def finish_motion(action, expected=layout_and_input):
        expect_home_motion(page, action, layout_and_input if reduced else expected, reduced=reduced)
        expect(resizing).to_have_count(0)

    def heights():
        return page.locator(".example-options, .entry-panel").evaluate_all(
            "panels => panels.map(panel => panel.getBoundingClientRect().height)",
        )

    def expect_heights(action, expected):
        actual = heights()
        assert all(abs(a - b) <= 1 for a, b in zip(actual, expected, strict=True)), (
            f"{action}: expected settled panel heights {expected}, got {actual}"
        )

    def expect_file():
        expect_fixture_menu_closed(trigger, listbox)
        expect(trigger).to_contain_text("Tangkapan layar lowongan")
        expect(input_field).to_have_value("")
        expect(file_detail).to_be_visible()
        expect(download).to_be_visible()
        expect(remove_file).to_be_visible()

    def expect_empty(action):
        expect(trigger).to_contain_text("Pilih skenario")
        expect(input_field).to_have_value("")
        expect(file_detail).to_be_hidden()
        expect(download).to_be_hidden()
        expect(remove_file).to_be_hidden()
        expect_heights(action, empty_heights)

    message_tool.click()
    expect(message_tool).to_have_attribute("aria-pressed", "true")
    expect(message_tool).to_be_focused()
    empty_heights = heights()

    open_menu()
    expect_home_motion(page, "open scenario menu", (HOME_MENU_VIEWPORT,), reduced=reduced)
    focus_option(short_option, "Home", "ArrowDown")
    page.keyboard.press("Enter")
    finish_motion("choose short text", (HOME_LAYOUT_WRAPPERS[0], INPUT_SELECTION_CUE))
    expect_fixture_menu_closed(trigger, listbox)
    expect(input_field).to_have_value(re.compile(r"^Panitia Kelas Purnama Demo"))
    short_heights = heights()

    choose(file_option, "Home")
    finish_motion("switch from text to file")
    expect_file()
    file_heights = heights()
    assert all(file > short + 1 for short, file in zip(short_heights, file_heights, strict=True)), (
        f"The file fixture should expand both panels: {short_heights} -> {file_heights}"
    )

    choose(clear_option, "End")
    finish_motion("clear file fixture")
    expect_fixture_menu_closed(trigger, listbox)
    expect_empty("clear file fixture")
    page.keyboard.press("Tab")
    expect(input_field).to_be_focused()

    choose(short_option, "Home", "ArrowDown")
    # Reopen as soon as Radix restores focus, before waiting for the panels to settle.
    expect(trigger).to_be_focused()
    choose(file_option, "Home")
    finish_motion("choose two fixtures in succession")
    expect_file()
    expect_heights("choose two fixtures in succession", file_heights)

    link_tool.evaluate("""button => {
        const stage = document.querySelector('.stage-workspace');
        button.addEventListener('click', () => {
            const height = stage.offsetHeight;
            requestAnimationFrame(() => { window.shortcutHeight = [height, stage.offsetHeight]; });
        }, {capture: true, once: true});
    }""")
    link_tool.click()
    expect_home_motion(page, "switch specialist shortcut", (*layout_and_input, ".tool-selection"), reduced=reduced)
    before, first_frame = page.evaluate("window.shortcutHeight")
    if not reduced:
        assert abs(before - first_frame) <= 8, f"Shortcut jumped on the first frame: {before} → {first_frame}"
    expect(resizing).to_have_count(0)
    expect(message_tool).to_have_attribute("aria-pressed", "false")
    expect(link_tool).to_have_attribute("aria-pressed", "true")
    expect(link_tool).to_be_focused()
    expect(listbox).to_be_hidden()
    expect_empty("switch specialist shortcut")
    assert page.locator(".stage-workspace").evaluate("stage => stage.offsetHeight") < before

    # The text fixture has no download link between the trigger and textarea in the tab order.
    for close_key in ("Enter", "Escape"):
        open_menu()
        focus_option(fixture_option(listbox, "benign_url"), "Home")
        page.keyboard.press(close_key)
        page.keyboard.press("Tab")
        expect(listbox).to_have_count(0)
        expect(trigger).to_have_attribute("aria-expanded", "false")
        expect(input_field).to_be_focused()
        expect(input_field).to_have_value("https://kampus.example/pengumuman")
    print(f"PASS gerak form beranda ({mode}): pilihan, kosongkan, pilihan berurutan, pintasan, fokus, Tab cepat", flush=True)


def select_fixture(page, fixture):
    nav(page, "Cek baru")
    trigger = page.get_by_role("combobox", name=EXAMPLE_CHOOSER, exact=True)
    trigger.click()
    listbox = page.get_by_role("listbox")
    expect(listbox).to_be_visible()
    option = fixture_option(listbox, fixture)
    option.scroll_into_view_if_needed()
    option.click()
    expect_fixture_menu_closed(trigger, listbox)
    button(page, "Tinjau pemeriksaan").click()


def approve(page):
    start_button = button(page, "Mulai simulasi")
    consent = page.get_by_role("checkbox", name=CONSENT, exact=True)
    expect(start_button).to_be_disabled()
    expect(consent).to_have_attribute("aria-checked", "false")
    page.locator(".consent-choice").get_by_text(CONSENT, exact=True).click()
    expect(consent).to_have_attribute("aria-checked", "true")
    expect(start_button).to_be_enabled()


def finish(page, verdict):
    focused_h1(page, REPORT)
    expect(page.locator("#verdict-heading")).to_have_text(verdict)
    expect(page.locator(".scan-beam")).to_have_count(0)
    selector = ".verdict-band img.verdict-art"
    art = page.locator(selector)
    expect(art).to_be_visible()
    expect(art).to_have_attribute("data-verdict", VERDICT_ART_CODES[verdict])
    expect(art).to_have_attribute("alt", "")
    page.wait_for_function("selector => document.querySelector(selector)?.naturalWidth > 0", arg=selector)
    return art.evaluate("image => image.currentSrc")


def start(page, verdict, external=True):
    if external:
        approve(page)
    button(page, "Mulai simulasi").click()
    return finish(page, verdict)


def check_layout(page):
    assert page.evaluate("document.documentElement.scrollWidth") <= page.viewport_size["width"], "Horizontal overflow"
    assert page.evaluate("[...document.fonts].some(font => font.family === 'DM Sans' && font.status === 'loaded')"), "DM Sans did not load"


def check_date_label(scope):
    date = scope.locator("time.date-label")
    expect(date).to_be_visible()
    expect(date).to_have_text(re.compile(r"\bWIB\s*$"))
    value = date.get_attribute("datetime")
    assert value and datetime.fromisoformat(value).utcoffset() is not None, f"Timestamp needs a timezone: {value}"


def check_home_art(page):
    expect(page.locator(".home-art")).to_have_attribute("aria-hidden", "true")
    page.wait_for_function(
        "() => document.querySelector('.home-art[aria-hidden=true] img')?.naturalWidth > 0",
    )


def check_screen_motion(page, view, *selectors):
    screen = page.locator(f'.screen-motion[data-view="{view}"]')
    for selector in selectors:
        expect(screen.locator(selector).first).to_be_visible()

    try:
        page.emulate_media(reduced_motion="no-preference")
        assert page.evaluate("matchMedia('(prefers-reduced-motion: no-preference)').matches")
        for selector in selectors:
            durations = screen.locator(selector).first.evaluate("""element => element.getAnimations()
                .filter(animation => animation instanceof CSSAnimation && animation.playState !== 'paused')
                .map(animation => animation.effect.getComputedTiming().duration)""")
            assert any(duration >= 50 for duration in durations), (
                f"{view} {selector}: expected a CSS entrance animation of at least 50ms, got {durations}"
            )
    finally:
        page.emulate_media(reduced_motion="reduce")

    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    active_motion = screen.evaluate("""screen => screen.getAnimations({subtree: true}).filter(animation => {
        const {activeDuration, delay} = animation.effect.getComputedTiming();
        return activeDuration > 1 || delay > 0;
    }).map(animation => animation.animationName ?? animation.transitionProperty ?? 'animation')""")
    assert not active_motion, f"{view}: motion still active with reduced motion: {active_motion}"


def screenshot(page, name, full=False, *, target=None):
    check_layout(page)
    if target is None:
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=OUTPUT / name, full_page=full, animations="disabled")
    else:
        target.screenshot(path=OUTPUT / name, animations="disabled")


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
    assert page.evaluate("[...document.fonts].some(font => font.family === 'Fraunces' && font.status === 'loaded')"), "Fraunces did not load"
    assert button(page, "Tinjau pemeriksaan").evaluate("element => element.getBoundingClientRect().bottom <= innerHeight"), "Primary action below the initial viewport"
    check_screen_motion(
        page, "home", "h1 .hero-line:first-child .motion-in",
        "h1 .hero-line:last-child .motion-in", ".check-stage.motion-in",
    )
    screenshot(page, f"{device}-home-{width}.png", full=True)

    if device == "desktop":
        page.keyboard.press("Tab")
        expect(page.get_by_role("link", name="Lewati ke konten")).to_be_focused()
        page.keyboard.press("Enter")
        page.keyboard.press("Tab")
        expect(page.get_by_role("combobox", name=EXAMPLE_CHOOSER, exact=True)).to_be_focused()
    check_fixture_menu(page, device, width)
    if device == "desktop":
        select_fixture(page, "scam_screenshot")
        focused_h1(page, "Tinjau pemeriksaan")
        field = page.get_by_label("Teks hasil ekstraksi simulasi")
        confirmation = button(page, "Konfirmasi teks")
        expect(confirmation).to_be_disabled()
        field.fill(field.input_value().replace("deposlt", "deposit"))
        confirmation.focus()
        page.keyboard.press("Enter")
        expect(page.get_by_text("Hasil dikonfirmasi", exact=True)).to_be_visible()
        verdict = "Mencurigakan"
    elif device == "tablet":
        nav(page, "Cek baru")
        shortcut = button(page, "Tautan & QR")
        shortcut.click()
        expect(shortcut).to_be_focused()
        upload_from_button(page, ROOT / "public/contoh/qr-demo.png")
        button(page, "Tinjau pemeriksaan").click()
        focused_h1(page, "Tinjau pemeriksaan")
        button(page, "Konfirmasi tautan dari QR").click()
        verdict = "Berbahaya"
    else:
        nav(page, "Cek baru")
        upload_from_button(page, ROOT / "public/contoh/lampiran-demo.txt")
        button(page, "Tinjau pemeriksaan").click()
        focused_h1(page, "Tinjau pemeriksaan")
        verdict = "Berbahaya"

    heading(page, "Tinjau pemeriksaan")
    check_workspace_step(page, "Tinjau")
    expect(page.get_by_role("heading", name="Persetujuan cek eksternal")).to_be_visible()
    # Sample panels and rows because arrival focus may suppress motion on the headings.
    check_screen_motion(page, "analyzer", ".screen-panel.motion-in, .screen-panel .rows.motion-in")
    screenshot(page, f"{device}-tinjau-{width}.png", full=True)
    result_art = start(page, verdict)
    check_workspace_step(page, "Hasil")
    check_screen_motion(page, "result", ".result-panel.motion-in, .result-panel .motion-in")
    focused_h1(page, REPORT)
    check_date_label(page.locator(".result-intro"))
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
        focused_h1(page, "Tinjau bahan tambahan")
        button(page, "Konfirmasi tautan dari QR").click()
        result_art = start(page, "Berbahaya")
        expect(page.get_by_text("lowongan[.]example", exact=True)).to_be_visible()
        expect(page.get_by_text("verifikasi[.]example", exact=True)).to_be_visible()
    elif device == "mobile":
        button(page, "Ulangi cek yang gagal").click()
        retry_art = finish(page, "Berbahaya")
        expect(page.locator(".verdict-band").get_by_text("Pemeriksaan selesai", exact=True)).to_be_visible()
        assert retry_art == result_art, "UNSAFE artwork changed when the process completed"

    nav(page, "Riwayat")
    expect(page.locator(".workspace-steps")).to_have_count(0)
    expect(page.locator(".history-row")).to_have_count(1)
    check_date_label(page.locator(".history-row"))
    check_screen_motion(page, "history", ".history-list.motion-in, .history-row.motion-in, .history-row .motion-in")
    if device == "desktop":
        screenshot(page, "desktop-riwayat-1440.png")
    button(page, "Buka hasil").click()
    focused_h1(page, REPORT)
    check_workspace_step(page, "Hasil")
    nav(page, "Riwayat")
    button(page, "Hapus entri").click()
    heading(page, "Belum ada pemeriksaan di sesi ini.")

    select_fixture(page, "file_too_large")
    expect(page.get_by_role("alert")).to_contain_text("File melebihi batas 5 MB")
    screenshot(page, f"{device}-validasi-{width}.png", full=True)
    print(
        f"PASS {device} {width}px: dropdown, input, persetujuan, hasil/bukti/ilustrasi, riwayat dan WIB, validasi, motion normal/reduce, tanpa overflow",
        flush=True,
    )
    return result_art


def check_ocr_keyboard(page):
    select_fixture(page, "scam_screenshot")
    focused_h1(page, "Tinjau pemeriksaan")
    confirmation = button(page, "Konfirmasi teks")
    expect(confirmation).to_be_disabled()
    button(page, "Gunakan teks contoh").press("Enter")
    expect(confirmation).to_be_focused()
    page.keyboard.press("Enter")
    consent_heading = "Persetujuan cek eksternal"
    expect(page.get_by_role("heading", name=consent_heading, exact=True)).to_be_focused()
    page.keyboard.press("Tab")
    consent = page.get_by_role("checkbox", name=CONSENT, exact=True)
    expect(consent).to_be_focused()
    expect(consent).to_have_attribute("aria-checked", "false")
    page.keyboard.press("Space")
    expect(consent).to_have_attribute("aria-checked", "true")
    expect(button(page, "Mulai simulasi")).to_be_enabled()
    page.keyboard.press("Space")
    expect(consent).to_have_attribute("aria-checked", "false")
    expect(button(page, "Mulai simulasi")).to_be_disabled()
    expect(page.get_by_text("Hasil dikonfirmasi", exact=True)).to_be_visible()
    consent_panel = page.get_by_role("region", name=consent_heading, exact=True)
    screenshot(page, "mobile-fokus-lanjut-390.png", target=consent_panel)


def other_scenarios(page, device, unsafe_art):
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
    chooser = page.get_by_role("combobox", name=EXAMPLE_CHOOSER, exact=True)
    expect(chooser).to_be_visible()
    button(page, EXAMPLE_CHOOSER).press("Enter")
    expect(chooser).to_be_focused()
    if device == "mobile":
        screenshot(page, "mobile-batas-demo-390.png", full=True)

    nav(page, "Cek baru")
    textarea.fill("https://kampus.example/pengumuman")
    button(page, "Tinjau pemeriksaan").click()
    local_only = button(page, "Lanjutkan tanpa cek eksternal")
    scope_note = page.locator("#local-checks-note")
    expect(scope_note).to_be_visible()
    expect(scope_note).to_contain_text(re.compile(r"\b(?:hanya\b.*\blokal|lokal\s+saja)\b", re.IGNORECASE))
    expect(local_only).to_have_attribute(
        "aria-describedby", re.compile(r"(?:^|\s)local-checks-note(?:\s|$)"),
    )
    local_only.click()
    finish(page, "Belum dapat disimpulkan")
    expect(page.get_by_text("Dilewati karena izin belum diberikan.", exact=True)).to_be_visible()
    select_fixture(page, "benign_url")
    domain_check = page.get_by_role("checkbox", name="Identifikasi domain lokal", exact=True)
    choice = page.locator(".check-choice").filter(has=domain_check)
    expect(choice).to_be_visible()
    bounds = choice.bounding_box()
    assert bounds and bounds["height"] >= 44, f"Optional check target is under 44 CSS px: {bounds}"
    expect(domain_check).to_have_attribute("aria-checked", "false")
    choice.get_by_text("Identifikasi domain lokal", exact=True).click()
    expect(domain_check).to_have_attribute("aria-checked", "true")
    if device == "mobile":
        checks = page.get_by_role("region", name="Pemeriksaan yang dipilih", exact=True)
        screenshot(page, "mobile-kontrol-analyzer-390.png", target=checks)
    not_flagged_art = start(page, "Tidak ada indikasi terdeteksi")
    expect(page.get_by_text("Identifikasi domain lokal", exact=True)).to_be_visible()

    select_fixture(page, "scam_message")
    suspicious_art = start(page, "Mencurigakan", external=False)
    select_fixture(page, "unknown_timeout")
    inconclusive_art = start(page, "Belum dapat disimpulkan")
    button(page, "Ulangi cek yang gagal").click()
    finish(page, "Belum dapat disimpulkan")

    select_fixture(page, "loading_and_errors")
    approve(page)
    button(page, "Mulai simulasi").click()
    heading(page, "Simulasi pemeriksaan")
    button(page, "Batalkan").click()
    focused_h1(page, "Tinjau pemeriksaan")
    expect(page.get_by_role("status").filter(has_text="Simulasi dibatalkan.")).to_have_count(1)
    check_workspace_step(page, "Tinjau")
    expect(page.locator(".scan-beam")).to_have_count(0)
    button(page, "Mulai simulasi").click()
    expect(page.get_by_text("Sedang memeriksa", exact=True).first).to_be_visible()
    check_workspace_step(page, "Periksa")
    check_screen_motion(page, "progress", ".scan-beam")
    if device == "desktop":
        screenshot(page, "desktop-progres-1440.png")
    finish(page, "Belum dapat disimpulkan")
    expect(page.locator(".verdict-band").get_by_text("Batas pemeriksaan tercapai", exact=True)).to_be_visible()
    expect(button(page, "Ulangi cek yang gagal")).to_be_disabled()
    expect(button(page, "Ulangi cek yang gagal")).to_be_enabled()
    button(page, "Ulangi cek yang gagal").click()
    finish(page, "Tidak ada indikasi terdeteksi")
    page.locator(".evidence-panel summary").press("Enter")
    evidence_group = page.locator(".evidence-group").filter(
        has=page.get_by_role("heading", name="Tautan yang ditempel", exact=True),
    )
    for finding, label in (
        ("Kuota pemeriksaan simulasi tercapai.", "Percobaan sebelumnya"),
        ("Indeks simulasi mencakup URL ini tanpa penanda berbahaya.", "Percobaan terbaru"),
    ):
        item = evidence_group.locator(".evidence-item").filter(has=page.get_by_text(finding, exact=True))
        attempt = item.locator(".attempt-tag")
        expect(attempt).to_have_text(label)
        expect(attempt).to_be_visible()
    if device == "mobile":
        screenshot(page, "mobile-jejak-retry-390.png", target=evidence_group)
    nav(page, "Riwayat")
    expect(page.get_by_role("heading", name="Antrean dan batas pemeriksaan", exact=True)).to_have_count(1)

    select_fixture(page, "apk_indicators")
    start(page, "Mencurigakan", external=False)
    expect(page.locator(".result-intro")).to_contain_text("Pratinjau P1")
    select_fixture(page, "synthetic_image")
    unassessed_art = start(page, "Keamanan belum dinilai", external=False)
    expect(page.get_by_text("Kemungkinan dibuat AI", exact=True)).to_be_visible()
    art_sources = {unsafe_art, not_flagged_art, suspicious_art, inconclusive_art, unassessed_art}
    assert len(art_sources) == 5, f"Expected five distinct verdict artwork sources, got {art_sources}"
    page.reload()
    nav(page, "Riwayat")
    heading(page, "Belum ada pemeriksaan di sesi ini.")
    print(f"PASS fixture lain {device}: pesan, tautan, hash, izin ditolak, OCR, batas kuota, batal/retry, pratinjau P1, 5 ilustrasi verdict, reset", flush=True)


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
            if name == "desktop":
                for reduced in (False, True):
                    check_home_layout_motion(page, reduced=reduced)
            unsafe_art = capture_and_check(page, name, width)
            if name == "mobile":
                check_ocr_keyboard(page)
            if name in ("desktop", "mobile"):
                other_scenarios(page, name, unsafe_art)
            context.close()
        browser.close()

    assert not errors, errors
    assert not external, external
    print("PASS konsol: 0 error | HTTP eksternal: 0 permintaan", flush=True)


if __name__ == "__main__":
    main()
