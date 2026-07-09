// АВТОСГЕНЕРИРОВАНО из «Обновление меню/Меню Для макета NEW .xlsx» (листы «БА», «Алкоголь», «Кальяны», «Кухня Авторская», «Кухня Летняя»).
// Синяя заливка строки в файле -> type: 1 (полная карточка, своё фото).
// Белая/без заливки -> type: 2 (простая карточка, общее фото на категорию).
// Используется на боевом /arka (сейчас только категория «Бар») — см. CategoryPage.
// `id` стабилен (порядковый по позиции в исходном xlsx) — используется для корзины
// и /item/[itemId] через toResolvedArkaBarItems(). Не завязано на packages/db.

export type ArkaMenuItem = {
  id: string;
  name: string;
  type: 1 | 2;
  priceParts: string[];
  volume: string | null;
  description: string | null;
};

export type ArkaMenuEntry =
  | { kind: 'header'; sheet: string; title: string }
  | { kind: 'category'; sheet: string; category: string; items: ArkaMenuItem[] };

export const ARKA_BAR_SECTIONS: ArkaMenuEntry[] = [
  { kind: 'category', sheet: "БА", category: "Лимонады", items: [
    { id: "arka-bar-0000", name: "Манго Маракуйя Кокос", type: 1, priceParts: ["650", "1300"], volume: "300мл/1л", description: "Манго, маракуйя, кокос, ваниль, содовая" },
    { id: "arka-bar-0001", name: "Апельсин Юдзу Миндаль", type: 1, priceParts: ["650", "1300"], volume: "300мл/1л", description: "Апельсин, юдзу, лимон, миндаль, содовая" },
    { id: "arka-bar-0002", name: "Гранат Клубника", type: 1, priceParts: ["650", "1300"], volume: "300мл/1л", description: "Гранат, клубника, суданская роза, содовая" },
    { id: "arka-bar-0003", name: "Киви Крыжовник Фейхоа", type: 1, priceParts: ["650", "1300"], volume: "300мл/1л", description: "Киви, яблоко, крыжовник, фейхоа, эстрагон, содовая" },
    { id: "arka-bar-0004", name: "Ананас Щавель", type: 1, priceParts: ["650", "1300"], volume: "300мл/1л", description: "Ананас, щавель, содовая" },
  ] },
  { kind: 'category', sheet: "БА", category: "Смузи", items: [
    { id: "arka-bar-0005", name: "Клубника Кокос Ананас", type: 2, priceParts: ["750"], volume: "300мл/1л", description: "Клубника, ананас, кокос, бобы тонка" },
    { id: "arka-bar-0006", name: "Тайский Манго", type: 2, priceParts: ["750"], volume: "300мл/1л", description: "Манго, ананас, банан" },
    { id: "arka-bar-0007", name: "Клубника Малина", type: 2, priceParts: ["750"], volume: "300мл/1л", description: "Клубника, малина, ананас" },
  ] },
  { kind: 'category', sheet: "БА", category: "Молочный коктейль", items: [
    { id: "arka-bar-0008", name: "Ваниль", type: 2, priceParts: ["700"], volume: "300мл", description: null },
    { id: "arka-bar-0009", name: "Клубника", type: 2, priceParts: ["700"], volume: "300мл", description: null },
    { id: "arka-bar-0010", name: "Шоколад", type: 2, priceParts: ["700"], volume: "300мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Сок", items: [
    { id: "arka-bar-0011", name: "Сок Rich", type: 2, priceParts: ["450"], volume: "200мл", description: "Апельсин, яблоко, вишня, томат" },
    { id: "arka-bar-0012", name: "Сок свежевыжатый", type: 2, priceParts: ["750"], volume: "300мл", description: "Апельсин / \nГрейпфрут / \nЯблоко" },
    { id: "arka-bar-0013", name: "Сок свежевыжатый", type: 2, priceParts: ["1200"], volume: "300мл", description: "Ананас" },
  ] },
  { kind: 'category', sheet: "БА", category: "Вода с газом / без", items: [
    { id: "arka-bar-0014", name: "Сан Бенедетто б.газ/газ", type: 2, priceParts: ["600", "1100"], volume: "250мл / 750мл", description: "газ / б.газ" },
    { id: "arka-bar-0015", name: "Легенда Байкала", type: 2, priceParts: ["550", "1000"], volume: "330мл / 750мл", description: "газ / б.газ" },
    { id: "arka-bar-0016", name: "Кока-Кола", type: 2, priceParts: ["550"], volume: "330мл", description: null },
    { id: "arka-bar-0017", name: "Кока-Кола Зеро", type: 2, priceParts: ["550"], volume: "330мл", description: null },
    { id: "arka-bar-0018", name: "Тоник", type: 2, priceParts: ["550"], volume: "330мл", description: null },
    { id: "arka-bar-0019", name: "Ред Булл", type: 2, priceParts: ["600"], volume: "250мл", description: null },
    { id: "arka-bar-0020", name: "Ред Булл без сахара", type: 2, priceParts: ["600"], volume: "250мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Авторские чаи", items: [
    { id: "arka-bar-0021", name: "Гранат Клубника", type: 1, priceParts: ["1200"], volume: "800мл", description: "Гранат, грейпфрут, клубника, суданская роза" },
    { id: "arka-bar-0022", name: "Морошка Маракуйя Апельсин Пихта", type: 1, priceParts: ["1200"], volume: "800мл", description: "Морошка, маракуйя, апельсин, пихта, розмарин" },
    { id: "arka-bar-0023", name: "Марокканский золотой", type: 1, priceParts: ["1200"], volume: "800мл", description: "Мандарин, тай пин, мусковадо, мята, цитрус, корица, гвоздика, белый кардамон" },
    { id: "arka-bar-0024", name: "Грейпфрут Малина", type: 1, priceParts: ["1200"], volume: "800мл", description: "Грейпфрут, малина, суданская роза, лимон" },
    { id: "arka-bar-0025", name: "Мятный с чабрецом и кардамоном", type: 1, priceParts: ["1200"], volume: "800мл", description: "Мята, тимьян свежий, белый кардамон, бадьян" },
  ] },
  { kind: 'category', sheet: "БА", category: "Классические чаи", items: [
    { id: "arka-bar-0026", name: "Ассам", type: 2, priceParts: ["800"], volume: "800мл", description: null },
    { id: "arka-bar-0027", name: "Эрл Грей", type: 2, priceParts: ["800"], volume: "800мл", description: null },
    { id: "arka-bar-0028", name: "Молочный улун", type: 2, priceParts: ["800"], volume: "800мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Премиальные чаи", items: [
    { id: "arka-bar-0029", name: "Моли чжень ло", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
    { id: "arka-bar-0030", name: "Габа", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
    { id: "arka-bar-0031", name: "Да хун пао", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
    { id: "arka-bar-0032", name: "Те гуан инь мао ча", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
    { id: "arka-bar-0033", name: "Лун Цзин", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
    { id: "arka-bar-0034", name: "Пуэр выдержанный", type: 2, priceParts: ["1400"], volume: "800мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Тизаны", items: [
    { id: "arka-bar-0035", name: "Таёжный травяной с тибетской ромашкой", type: 2, priceParts: ["1000"], volume: "800мл", description: null },
    { id: "arka-bar-0036", name: "Карельский подкопчённый с ягодами", type: 2, priceParts: ["1000"], volume: "800мл", description: null },
    { id: "arka-bar-0037", name: "Малина с мятой", type: 2, priceParts: ["1000"], volume: "800мл", description: null },
    { id: "arka-bar-0038", name: "Гречишный", type: 2, priceParts: ["1000"], volume: "800мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Чайные добавки", items: [
    { id: "arka-bar-0039", name: "Свежий тимьян", type: 2, priceParts: ["100"], volume: null, description: null },
    { id: "arka-bar-0040", name: "Листья свежей мяты", type: 2, priceParts: ["100"], volume: null, description: null },
    { id: "arka-bar-0041", name: "Цветы розы", type: 2, priceParts: ["100"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Кофе", items: [
    { id: "arka-bar-0042", name: "Двойной эспрессо", type: 2, priceParts: ["400"], volume: "60мл", description: null },
    { id: "arka-bar-0043", name: "Американо", type: 2, priceParts: ["400"], volume: "200мл", description: null },
    { id: "arka-bar-0044", name: "Флэт Уайт", type: 2, priceParts: ["550"], volume: "220мл", description: null },
    { id: "arka-bar-0045", name: "Капучино", type: 2, priceParts: ["550"], volume: "220мл", description: null },
    { id: "arka-bar-0046", name: "Латте", type: 2, priceParts: ["600"], volume: "300мл", description: null },
    { id: "arka-bar-0047", name: "Айс Латте", type: 2, priceParts: ["600"], volume: "300мл", description: null },
    { id: "arka-bar-0048", name: "Раф Кофе", type: 2, priceParts: ["600"], volume: "300мл", description: null },
    { id: "arka-bar-0049", name: "Эспрессо Тоник", type: 2, priceParts: ["500"], volume: "300мл", description: null },
    { id: "arka-bar-0050", name: "Бамбл Кофе", type: 2, priceParts: ["600"], volume: "300мл", description: null },
    { id: "arka-bar-0051", name: "Какао Карамель", type: 2, priceParts: ["600"], volume: "300мл", description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Добавки", items: [
    { id: "arka-bar-0052", name: "Топпинги сироп/ Кокосовое молоко / Миндальное молоко", type: 2, priceParts: ["150"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "БА", category: "Закуски", items: [
    { id: "arka-bar-0053", name: "Арахис соленый", type: 2, priceParts: ["550"], volume: null, description: null },
    { id: "arka-bar-0054", name: "Микс орехов, нут с пармезаном и рисовые крекеры с васаби", type: 2, priceParts: ["720"], volume: "100гр", description: "Миндаль в специях, кешью в специях, фисташки очищенные, нут с пармезаном, рисовые крекеры с васаби" },
    { id: "arka-bar-0055", name: "Микс в специях", type: 2, priceParts: ["720"], volume: "75гр", description: "Кешью, арахис, миндаль" },
    { id: "arka-bar-0056", name: "Чипсы", type: 2, priceParts: ["350"], volume: "70гр", description: "В ассортименте" },
    { id: "arka-bar-0057", name: "Вяленое мясо", type: 2, priceParts: ["500"], volume: "50гр", description: "Курица, индейка, говядина" },
  ] },
  { kind: 'category', sheet: "БА", category: "Сладости", items: [
    { id: "arka-bar-0058", name: "Мороженое шарики", type: 2, priceParts: ["450"], volume: null, description: "Ваниль, шоколад, клубника" },
  ] },
  { kind: 'header', sheet: "Алкоголь", title: "Коктейли" },
  { kind: 'category', sheet: "Алкоголь", category: "Авторские коктейли", items: [
    { id: "arka-bar-0059", name: "Виолет", type: 1, priceParts: ["1100"], volume: "350мл", description: "Джин, черёмуха, голубика, васильки, бузина, игристое вино" },
    { id: "arka-bar-0060", name: "Пинко", type: 1, priceParts: ["1100"], volume: "350мл", description: "Сарти Роза, клубника, игристое вино" },
    { id: "arka-bar-0061", name: "Хуго", type: 1, priceParts: ["1100"], volume: "350мл", description: "Персик, бузина, игристое вино" },
    { id: "arka-bar-0062", name: "Клубника Тонка", type: 1, priceParts: ["1100"], volume: "350мл", description: "Апероль, клубника, бобы тонка, игристое вино" },
    { id: "arka-bar-0063", name: "Грейп Тоник", type: 1, priceParts: ["1100"], volume: "300мл", description: "Джин розовый грейпфрут, грейпфрут, тоник" },
    { id: "arka-bar-0064", name: "Бэйзил Тоник", type: 1, priceParts: ["1100"], volume: "300мл", description: "Джин, базилик, тоник" },
    { id: "arka-bar-0065", name: "Оранж Тоник", type: 1, priceParts: ["1100"], volume: "300мл", description: "Джин юдзу белая клубника, апельсин, юдзу, тоник" },
    { id: "arka-bar-0066", name: "Манго Колада", type: 1, priceParts: ["1100"], volume: "300мл", description: "Манго, маракуйя, кокос, пряный и светлый ром" },
    { id: "arka-bar-0067", name: "Бэйзил Смэш", type: 1, priceParts: ["1100"], volume: "300мл", description: "Джин, базилик" },
    { id: "arka-bar-0068", name: "Апероль Клубника Сауэр", type: 1, priceParts: ["1100"], volume: "120мл", description: "Апероль, клубника, бобы тонка" },
    { id: "arka-bar-0069", name: "Земляничный Негрони", type: 1, priceParts: ["1100"], volume: "90мл", description: "Земляника, шисо, джин, красный вермут, кампари" },
    { id: "arka-bar-0070", name: "Слива Голубика", type: 1, priceParts: ["1100"], volume: "80мл", description: "Соджу слива, кордиал голубика, черёмуха" },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Настойки", items: [
    { id: "arka-bar-0071", name: "Манго Маракуйя", type: 2, priceParts: ["1100"], volume: "4*50мл", description: null },
    { id: "arka-bar-0072", name: "Ягодный Негрони", type: 2, priceParts: ["1100"], volume: "4*50мл", description: null },
    { id: "arka-bar-0073", name: "Апельсин Юдзу", type: 2, priceParts: ["1100"], volume: "4*50мл", description: null },
    { id: "arka-bar-0074", name: "Слива Голубика", type: 2, priceParts: ["1100"], volume: "4*50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Авторские коктейли", items: [
    { id: "arka-bar-0075", name: "Ягодный Глинтвейн", type: 2, priceParts: ["1100"], volume: "300мл", description: "Красное вино, черная смородина, апельсин, специи" },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Классические коктейли", items: [
    { id: "arka-bar-0076", name: "Апероль Спритц", type: 2, priceParts: ["950"], volume: "350мл", description: "Апероль, игристое вино, содовая, апельсин" },
    { id: "arka-bar-0077", name: "Порнстар Мартини", type: 2, priceParts: ["950"], volume: "220мл", description: "Водка, игристое вино, маракуйя, ваниль" },
    { id: "arka-bar-0078", name: "Кловер Клаб", type: 2, priceParts: ["950"], volume: "120мл", description: "Джин, малина, лимон" },
    { id: "arka-bar-0079", name: "Мохито", type: 2, priceParts: ["950"], volume: "300мл", description: "Ром, сахар, лайм, мята" },
    { id: "arka-bar-0080", name: "Негрони", type: 2, priceParts: ["950"], volume: "100мл", description: "Кампари, джин, красный вермут" },
    { id: "arka-bar-0081", name: "Лонг Айленд", type: 2, priceParts: ["950"], volume: "300мл", description: "Водка, ром светлый, текила, джин, апельсиновый ликер, лимон, сахар" },
    { id: "arka-bar-0082", name: "Кровавая Мэри", type: 2, priceParts: ["950"], volume: "300мл", description: "Водка, томат, табаско, юдзу, вустерский соус, соль, специи" },
  ] },
  { kind: 'header', sheet: "Алкоголь", title: "Винная карта" },
  { kind: 'category', sheet: "Алкоголь", category: "Игристые и шампанские вина", items: [
    { id: "arka-bar-0083", name: "Бленд Гранд Кюве 1531. Франция. Брют.", type: 2, priceParts: ["1350", "7000"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0084", name: "Просекко Пассапарола. Италия. Брют.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0085", name: "Ламбруско Алеотти. Италия. П/сл.", type: 2, priceParts: ["800", "4000"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0086", name: "Креман Ален Байи Петроний. Франция. Брют.", type: 2, priceParts: ["12000"], volume: "750мл", description: null },
    { id: "arka-bar-0087", name: "Моёт & Шандон. Франция. Брют.", type: 2, priceParts: ["16500"], volume: "750мл", description: null },
    { id: "arka-bar-0088", name: "Бленд Фоллеман Розе. Франция. Брют.", type: 2, priceParts: ["19000"], volume: "750мл", description: null },
    { id: "arka-bar-0089", name: "Кава Кастель Лорд. Испания. Брют.", type: 2, priceParts: ["5500"], volume: "750мл", description: null },
    { id: "arka-bar-0090", name: "Бруни Асти. Италия. Сл.", type: 2, priceParts: ["5500"], volume: "750мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Белые вина", items: [
    { id: "arka-bar-0091", name: "Шардоне Локо Чимбали. Аргентина. Сух.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0092", name: "Пино Гриджио Прадио Приара. Италия. Сух.", type: 2, priceParts: ["1200", "6000"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0093", name: "Шенен Блан Симонсиг. ЮАР. П/сух.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0094", name: "Совиньон Блан Паддл Крик. Новая Зеландия. П/сух.", type: 2, priceParts: ["1200", "6000"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0095", name: "Совиньон Блан Жарден де ля Тор Марсан. Франция. Сух.", type: 2, priceParts: ["3500"], volume: "750мл", description: null },
    { id: "arka-bar-0096", name: "Шардоне Ле Гран Нуар. Франция. Сух.", type: 2, priceParts: ["5000"], volume: "750мл", description: null },
    { id: "arka-bar-0097", name: "Шардоне Жан-Марк Брокар Шабли. Франция. Сух.", type: 2, priceParts: ["12000"], volume: "750мл", description: null },
    { id: "arka-bar-0098", name: "Пфефферер. Италия. П/сух.", type: 2, priceParts: ["5900"], volume: "750мл", description: null },
    { id: "arka-bar-0099", name: "Вердехо Маркиз де Рискаль. Испания. Сух.", type: 2, priceParts: ["6500"], volume: "750мл", description: null },
    { id: "arka-bar-0100", name: "Рислинг Ник Вайс. Германия. П/сух.", type: 2, priceParts: ["8000"], volume: "750мл", description: null },
    { id: "arka-bar-0101", name: "Грюнер Вельтлинер Настл. Австрия. Сух.", type: 2, priceParts: ["6000"], volume: "750мл", description: null },
    { id: "arka-bar-0102", name: "Шардоне Виньярдс. Аргентина. Сух.", type: 2, priceParts: ["3400"], volume: "750мл", description: null },
    { id: "arka-bar-0103", name: "Рислинг Галицкий. Россия. Сух.", type: 2, priceParts: ["7500"], volume: "750мл", description: null },
    { id: "arka-bar-0104", name: "Каберне Совиньон Старая дорога на Джанхот. Россия. Сух.", type: 2, priceParts: ["7000"], volume: "750мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Розовые вина", items: [
    { id: "arka-bar-0105", name: "Бленд Фламинго Николаев и сыновья. Россия. Сух.", type: 2, priceParts: ["850", "4250"], volume: "150мл / 750мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Красные вина", items: [
    { id: "arka-bar-0106", name: "Пино Нуар Ле Гран Нуар. Франция. П/сух.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0107", name: "Мальбек Луиджи Боска. Аргентина. Сух.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0108", name: "Примитиво Примосоле. Италия. П/сух.", type: 2, priceParts: ["1100", "5000"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0109", name: "Бленд Петрикор Шумринка. Россия. Сух.", type: 2, priceParts: ["1100", "5500"], volume: "150мл / 750мл", description: null },
    { id: "arka-bar-0110", name: "Жарден де ля Тор Гренаш Сира. Франция. П/сух.", type: 2, priceParts: ["3500"], volume: "750мл", description: null },
    { id: "arka-bar-0111", name: "Санджовезе Нипоццано Кьянти Руфина. Италия. Сух.", type: 2, priceParts: ["9000"], volume: "750мл", description: null },
    { id: "arka-bar-0112", name: "Темпранильо Матсу Эль Пикаро. Испания. Сух.", type: 2, priceParts: ["5500"], volume: "750мл", description: null },
    { id: "arka-bar-0113", name: "Пино Нуар Каролина Ресерва. Чили. Сух.", type: 2, priceParts: ["3500"], volume: "750мл", description: null },
    { id: "arka-bar-0114", name: "Карменер Селлар Селекшн. Чили. П/сух.", type: 2, priceParts: ["3000"], volume: "750мл", description: null },
    { id: "arka-bar-0115", name: "Шираз Теннесити Макларен. Австралия. Сух.", type: 2, priceParts: ["7500"], volume: "750мл", description: null },
    { id: "arka-bar-0116", name: "Зинфандель Краб&Мо. США. П/сух.", type: 2, priceParts: ["5500"], volume: "750мл", description: null },
    { id: "arka-bar-0117", name: "Каберне Фран Южная Вертикаль. Россия. Сух.", type: 2, priceParts: ["7000"], volume: "750мл", description: null },
    { id: "arka-bar-0118", name: "Бленд Красная книга Глава 2 Скалистый берег. Россия. Сух.", type: 2, priceParts: ["7000"], volume: "750мл", description: null },
  ] },
  { kind: 'header', sheet: "Алкоголь", title: "Крепкий алкоголь" },
  { kind: 'category', sheet: "Алкоголь", category: "Аперетивы / Биттеры / Ликёры", items: [
    { id: "arka-bar-0119", name: "Мартини Бьянко. Италия.", type: 2, priceParts: ["600"], volume: "100мл", description: null },
    { id: "arka-bar-0120", name: "Мартини Россо. Италия.", type: 2, priceParts: ["600"], volume: "100мл", description: null },
    { id: "arka-bar-0121", name: "Мартини Фиеро. Италия.", type: 2, priceParts: ["600"], volume: "100мл", description: null },
    { id: "arka-bar-0122", name: "Апероль. Италия.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
    { id: "arka-bar-0123", name: "Сарти Роза. Италия.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
    { id: "arka-bar-0124", name: "Бэйлис. Ирландия.", type: 2, priceParts: ["650"], volume: "50мл", description: null },
    { id: "arka-bar-0125", name: "Ягермейстер. Германия.", type: 2, priceParts: ["650"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Текила", items: [
    { id: "arka-bar-0126", name: "Эль Текиленьо Бланко. Мексика.", type: 2, priceParts: ["750"], volume: "50мл", description: null },
    { id: "arka-bar-0127", name: "Эль Текиленьо Репосадо. Мексика.", type: 2, priceParts: ["850"], volume: "50мл", description: null },
    { id: "arka-bar-0128", name: "Хосе Куэрво 1800 Бланко. Мексика.", type: 2, priceParts: ["850"], volume: "50мл", description: null },
    { id: "arka-bar-0129", name: "Сенот Бланко. Мексика.", type: 2, priceParts: ["1250"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Джин", items: [
    { id: "arka-bar-0130", name: "Бомбей Сапфир. Великобритания.", type: 2, priceParts: ["850"], volume: "50мл", description: null },
    { id: "arka-bar-0131", name: "Бифитер. Великобритания.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
    { id: "arka-bar-0132", name: "Уитли Нейлл Розовый Грейпфрут. Великобритания.", type: 2, priceParts: ["700"], volume: "50мл", description: null },
    { id: "arka-bar-0133", name: "Уитли Нейлл Юдзу Белая клубника. Великобритания.", type: 2, priceParts: ["700"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Ром", items: [
    { id: "arka-bar-0134", name: "Такамака Бланко. Сейшельские острова.", type: 2, priceParts: ["650"], volume: "50мл", description: null },
    { id: "arka-bar-0135", name: "Такамака Дарк Спайсд. Сейшельские острова.", type: 2, priceParts: ["650"], volume: "50мл", description: null },
    { id: "arka-bar-0136", name: "Такамака Экстра Ноир. Сейшельские острова.", type: 2, priceParts: ["800"], volume: "50мл", description: null },
    { id: "arka-bar-0137", name: "Дипломатико Ботукал. Венесуэла.", type: 2, priceParts: ["1200"], volume: "50мл", description: null },
    { id: "arka-bar-0138", name: "Закапа 23 года. Гватемала.", type: 2, priceParts: ["1700"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Коньяк", items: [
    { id: "arka-bar-0139", name: "Хеннесси VS. Франция.", type: 2, priceParts: ["1250"], volume: "50мл", description: null },
    { id: "arka-bar-0140", name: "Хеннесси VSOP. Франция.", type: 2, priceParts: ["1700"], volume: "50мл", description: null },
    { id: "arka-bar-0141", name: "Хеннесси XO. Франция.", type: 2, priceParts: ["5500"], volume: "50мл", description: null },
    { id: "arka-bar-0142", name: "Эйч бай Хайн VSOP. Франция.", type: 2, priceParts: ["1350"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Виски односолодовый", items: [
    { id: "arka-bar-0143", name: "Гленфиддик 12 лет. Шотландия.", type: 2, priceParts: ["1350"], volume: "50мл", description: null },
    { id: "arka-bar-0144", name: "Макаллан Дабл Каск 12 лет. Шотландия.", type: 2, priceParts: ["2500"], volume: "50мл", description: null },
    { id: "arka-bar-0145", name: "Макаллан Дабл Каск 18 лет. Шотландия.", type: 2, priceParts: ["6500"], volume: "50мл", description: null },
    { id: "arka-bar-0146", name: "Абер Фоллс Сингл Молт Мадейра Каск. Великобритания.", type: 2, priceParts: ["900"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Виски купажированный", items: [
    { id: "arka-bar-0147", name: "Чивас Регал 12 лет. Шотландия.", type: 2, priceParts: ["1300"], volume: "50мл", description: null },
    { id: "arka-bar-0148", name: "Баллантайнс. Шотландия.", type: 2, priceParts: ["650"], volume: "50мл", description: null },
    { id: "arka-bar-0149", name: "Джэмисон. Ирландия.", type: 2, priceParts: ["800"], volume: "50мл", description: null },
    { id: "arka-bar-0150", name: "Джим Бим. США.", type: 2, priceParts: ["750"], volume: "50мл", description: null },
    { id: "arka-bar-0151", name: "Джек Дэниелс. США.", type: 2, priceParts: ["850"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Водка", items: [
    { id: "arka-bar-0152", name: "Онегин. Россия.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
    { id: "arka-bar-0153", name: "Белуга. Россия.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
    { id: "arka-bar-0154", name: "Мамонт. Россия.", type: 2, priceParts: ["600"], volume: "50мл", description: null },
  ] },
  { kind: 'category', sheet: "Алкоголь", category: "Пиво", items: [
    { id: "arka-bar-0155", name: "Францесканер. Россия.", type: 2, priceParts: ["700"], volume: "500мл", description: null },
    { id: "arka-bar-0156", name: "Шпатен. Россия.", type: 2, priceParts: ["700"], volume: "500мл", description: null },
    { id: "arka-bar-0157", name: "Аббе Брюн. Россия.", type: 2, priceParts: ["700"], volume: "500мл", description: null },
    { id: "arka-bar-0158", name: "Корона Экстра. Мексика.", type: 2, priceParts: ["700"], volume: "330мл", description: null },
    { id: "arka-bar-0159", name: "Стелла Артуа (б/а). Россия.", type: 2, priceParts: ["650"], volume: "440мл", description: null },
  ] },
];

export const ARKA_KITCHEN_SECTIONS: ArkaMenuEntry[] = [
  { kind: 'category', sheet: "Кухня Авторская", category: "Салаты", items: [
    { id: "arka-kitchen-0000", name: "КЛАССИЧЕСКИЙ ЦЕЗАРЬ С КРЕВЕТКАМИ", type: 2, priceParts: ["1290"], volume: null, description: null },
    { id: "arka-kitchen-0001", name: "КЛАССИЧЕСКИЙ ЦЕЗАРЬ С КУРИЦЕЙ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0002", name: "ОЛИВЬЕ СО СЛАБОСОЛЕНЫМ ЛОСОСЕМ", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0003", name: "ОЛИВЬЕ С КУРИНОЙ ГРУДКОЙ", type: 2, priceParts: ["520"], volume: null, description: null },
    { id: "arka-kitchen-0004", name: "САЛАТ ПО - ДЕРЕВЕНСКИ С КОПЧЁНОЙ СМЕТАНОЙ", type: 2, priceParts: ["550"], volume: null, description: null },
    { id: "arka-kitchen-0005", name: "САЛАТ ГРЕЧЕСКИЙ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0006", name: "БАКЛАЖАН ТЕМПУРА С УЗБЕКСКИМИ ТОМАТАМИ, ФИСТАШКАМИ И СОУСОМ SWEET CHILE", type: 2, priceParts: ["850"], volume: null, description: null },
    { id: "arka-kitchen-0007", name: "ТЁПЛЫЙ САЛАТ С МЯСОМ БЫЧКА (PRIMEBEEF), МИНИ КАРТОФЕЛЕМ И СОУСОМ ИЗ ТУНЦА", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0008", name: "БОЛЬШОЙ ЗЕЛЁНЫЙ САЛАТ", type: 2, priceParts: ["1290"], volume: null, description: null },
    { id: "arka-kitchen-0009", name: "РУККОЛА С КРЕВЕТКАМИ, КЛУБНИКОЙ И СЫРОМ ПАРМЕЗАН", type: 2, priceParts: ["1400"], volume: null, description: null },
    { id: "arka-kitchen-0010", name: "ГРИЛЬ - САЛАТ С МОРЕПРОДУКТАМИ И СЛИВОЧНЫМ СОУСОМ, НАСТОЯННЫМ НА ВОДОРОСЛЯХ ДАШИКОМБУ", type: 2, priceParts: ["1300"], volume: null, description: null },
    { id: "arka-kitchen-0011", name: "САЛАТ С ТУНЦОМ И ТРЮФЕЛЬНОЙ ЗАПРАВКОЙ", type: 2, priceParts: ["990"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "RAW", items: [
    { id: "arka-kitchen-0012", name: "ТАРТАР ИЗ ТУНЦА", type: 2, priceParts: ["950"], volume: null, description: null },
    { id: "arka-kitchen-0013", name: "ТАР ТАР ИЗ ГОВЯДИНЫ КЛАССИЧЕСКИЙ", type: 2, priceParts: ["1050"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Закуски", items: [
    { id: "arka-kitchen-0014", name: "БРУСКЕТТА С ЛОСОСЕМ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0015", name: "БРУСКЕТТА С ЛОСОСЕМ СПАЙСИ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0016", name: "БРУСКЕТТА С РОСТБИФОМ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0017", name: "МЯСНАЯ ТАРЕЛКА", type: 2, priceParts: ["1700"], volume: null, description: null },
    { id: "arka-kitchen-0018", name: "МЯСНАЯ ТАРЕЛКА ХАЛЯЛЬ", type: 2, priceParts: ["1000"], volume: null, description: null },
    { id: "arka-kitchen-0019", name: "СЫРНАЯ ТАРЕЛКА", type: 2, priceParts: ["1700"], volume: null, description: null },
    { id: "arka-kitchen-0020", name: "ОВОЩНОЙ СЕТ С СОУСОМ БЛЮЧИЗ", type: 2, priceParts: ["1100"], volume: null, description: null },
    { id: "arka-kitchen-0021", name: "ОЛИВКИ", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0022", name: "МАСЛИНЫ КАЛАМАТА", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0023", name: "ЗАКУСКА С СЕЛЬДЬЮ", type: 2, priceParts: ["590"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Горячие закуски", items: [
    { id: "arka-kitchen-0024", name: "ПОПКОРН ИЗ КРЕВЕТОК", type: 2, priceParts: ["1090"], volume: null, description: null },
    { id: "arka-kitchen-0025", name: "ПОПКОРН ИЗ КУРИЦЫ", type: 2, priceParts: ["590"], volume: null, description: null },
    { id: "arka-kitchen-0026", name: "СЫРНЫЕ ПАЛОЧКИ С БРУСНИЧНЫМ СОУСОМ", type: 2, priceParts: ["590"], volume: null, description: null },
    { id: "arka-kitchen-0027", name: "ЖУЛЬЕН С МОРЕПРОДУКТАМИ", type: 2, priceParts: ["790"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Стейки", items: [
    { id: "arka-kitchen-0028", name: "СТЕЙК МИНЬОН ЛАТИНСКАЯ АМЕРИКА", type: 2, priceParts: ["2300"], volume: null, description: "Латинская Америка ( с зеленым сливочным маслом. 200г)" },
    { id: "arka-kitchen-0029", name: "СТЕЙК РИБАЙ PRIMEBEEF BLACK ANGUS", type: 2, priceParts: ["1590"], volume: null, description: "PRIMEBEEF BLACK ANGUS. 200 дней зернового откорма (цена за 100г)" },
    { id: "arka-kitchen-0030", name: "СТЕЙК СТРИПЛОЙН", type: 2, priceParts: ["1100"], volume: null, description: "PRIMEBEEF BLACK ANGUS. 200 дней зернового откорма (цена за 100г)" },
    { id: "arka-kitchen-0031", name: "СТЕЙК ДЕНВЕР", type: 2, priceParts: ["2090"], volume: null, description: "PRIMEBEEF BLACK ANGUS. 200 дней зернового откорма ( с зеленым сливочным маслом. 250г)" },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Горячее", items: [
    { id: "arka-kitchen-0032", name: "СТЕЙК ИЗ ЛОСОСЯ СО ШПИНАТОМ И ШАМПИНЬОНАМИ", type: 2, priceParts: ["1690"], volume: null, description: null },
    { id: "arka-kitchen-0033", name: "ГРЕЧКА С КРЕВЕТКАМИ", type: 2, priceParts: ["850"], volume: null, description: null },
    { id: "arka-kitchen-0034", name: "КУРИНОЕ БЕДРО С БУЛГУРОМ", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0035", name: "КУРИНЫЙ СТЕЙК ТАНДУРИ С БРЮССЕЛЬСКОЙ КАПУСТОЙ И ТОМАТАМИ ЧЕРРИ", type: 2, priceParts: ["1150"], volume: null, description: null },
    { id: "arka-kitchen-0036", name: "ШНИЦЕЛЬ КУРИНЫЙ", type: 2, priceParts: ["1390"], volume: null, description: null },
    { id: "arka-kitchen-0037", name: "ЦЫПЛЁНОК НА ГРИЛЕ С УЗБЕКСКИМИ ТОМАТАМИ", type: 2, priceParts: ["1590"], volume: null, description: null },
    { id: "arka-kitchen-0038", name: "КОТЛЕТКИ ИЗ ИНДЕЙКИ С КАРТОФЕЛЬНЫМ ПЮРЕ И СОУСОМ", type: 2, priceParts: ["1100"], volume: null, description: null },
    { id: "arka-kitchen-0039", name: "ЩЁЧКИ БЫЧКА С КАРТОФЕЛЬНЫМ ПЮРЕ С СОУСОМ КОГИ", type: 2, priceParts: ["1600"], volume: null, description: null },
    { id: "arka-kitchen-0040", name: "ГОВЯДИНА В АЗИАТСКОМ СТИЛЕ С РИСОМ", type: 2, priceParts: ["1490"], volume: null, description: null },
    { id: "arka-kitchen-0041", name: "БЕФСТРОГАНОВ С КАРТОФЕЛЬНЫМ ПЮРЕ", type: 2, priceParts: ["1500"], volume: null, description: null },
    { id: "arka-kitchen-0042", name: "КАША ИЗ ТОПОРА", type: 2, priceParts: ["890"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Паста", items: [
    { id: "arka-kitchen-0043", name: "ПАППАРДЕЛЛЕ С ЛОСОСЕМ И КРАСНОЙ ИКРОЙ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0044", name: "ЛАПША С КУРИЦЕЙ И КРЕВЕТКАМИ В СОУСЕ КОКОСОВЫЙ ВОК И БОНИТО", type: 2, priceParts: ["850"], volume: null, description: null },
    { id: "arka-kitchen-0045", name: "ФЕТУЧИНИ С КУРИНЫМ БЕДРОМ ТЕРИЯКИ", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0046", name: "ЛИНГВИНИ КАРБОНАРА", type: 2, priceParts: ["790"], volume: null, description: null },
    { id: "arka-kitchen-0047", name: "ПЕННЕ С РОСТБИФОМ В ТРЮФЕЛЬНОМ СОУСЕ", type: 2, priceParts: ["1150"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Бургеры", items: [
    { id: "arka-kitchen-0048", name: "БУРГЕР БАРВИХА С ДВОЙНОЙ КОТЛЕТОЙ, КОНЬЯЧНЫМ СОУСОМ И КРЕМОМ ИЗ БЕЛЫХ ГРИБОВ", type: 2, priceParts: ["1390"], volume: null, description: null },
    { id: "arka-kitchen-0049", name: "БУРГЕР \"КЛАССИКА\" С КОТЛЕТОЙ ИЗ МРАМОРНОЙ ГОВЯДИНЫ С МЕДОВО - ГОРЧИЧНЫМ СОУСОМ", type: 2, priceParts: ["950"], volume: null, description: null },
    { id: "arka-kitchen-0050", name: "БУРГЕР \"СЫРНЫЙ\" С КОТЛЕТОЙ ИЗ МРАМОРНОЙ ГОВЯДИНЫ С БЕКОНОМ И ЯЙЦОМ", type: 2, priceParts: ["1150"], volume: null, description: null },
    { id: "arka-kitchen-0051", name: "БУРГЕР С КАМАМБЕРОМ, ГОВЯДИНОЙ И БРУСНИЧНЫМ СОУСОМ", type: 2, priceParts: ["1350"], volume: null, description: null },
    { id: "arka-kitchen-0052", name: "БУРГЕР С РВАНОЙ ГОВЯДИНОЙ, МАНГО И ХАЛАПЕНЬО", type: 2, priceParts: ["1590"], volume: null, description: null },
    { id: "arka-kitchen-0053", name: "БУРГЕР С ХРУСТЯЩИМ ЦЫПЛЁНКОМ", type: 2, priceParts: ["690"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Бургеры халяль", items: [
    { id: "arka-kitchen-0054", name: "ХАЛЯЛЬ БУРГЕР \"КЛАССИКА\" С КОТЛЕТОЙ ИЗ МРАМОРНОЙ ГОВЯДИНЫ С МЕДОВО - ГОРЧИЧНЫМ СОУСОМ", type: 2, priceParts: ["1050"], volume: null, description: null },
    { id: "arka-kitchen-0055", name: "ХАЛЯЛЬ БУРГЕР \"СЫРНЫЙ\" С КОТЛЕТОЙ ИЗ МРАМОРНОЙ ГОВЯДИНЫ И ЯЙЦОМ", type: 2, priceParts: ["1250"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Роллы", items: [
    { id: "arka-kitchen-0056", name: "РОЛЛ БАРВИХА", type: 2, priceParts: ["1590"], volume: null, description: null },
    { id: "arka-kitchen-0057", name: "РОЛЛ ФИЛАДЕЛЬФИЯ", type: 2, priceParts: ["1390"], volume: null, description: null },
    { id: "arka-kitchen-0058", name: "РОЛЛ КАЛИФОРНИЯ С ЛОСОСЕМ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0059", name: "РОЛЛ КАЛИФОРНИЯ С КРЕВЕТКОЙ", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0060", name: "РОЛЛ КАЛИФОРНИЯ С КРАБОМ", type: 2, priceParts: ["1490"], volume: null, description: null },
    { id: "arka-kitchen-0061", name: "РОЛЛ С АВОКАДО И ЛОСОСЕМ", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0062", name: "РОЛЛ ОПАЛЁНЫЙ ЛОСОСЬ С АПЕЛЬСИНОМ", type: 2, priceParts: ["950"], volume: null, description: null },
    { id: "arka-kitchen-0063", name: "РОЛЛ КРЕВЕТКА ТЕМПУРА", type: 2, priceParts: ["990"], volume: null, description: null },
    { id: "arka-kitchen-0064", name: "ТЁПЛЫЙ РОЛЛ С КРЕВЕТКОЙ И ЛОСОСЕМ", type: 2, priceParts: ["850"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Гунканы", items: [
    { id: "arka-kitchen-0065", name: "ГУНКАН КАНИ", type: 2, priceParts: ["280"], volume: null, description: null },
    { id: "arka-kitchen-0066", name: "ГУНКАН МАГУРО", type: 2, priceParts: ["380"], volume: null, description: null },
    { id: "arka-kitchen-0067", name: "ГУНКАН СЯКЕ", type: 2, priceParts: ["450"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Поке", items: [
    { id: "arka-kitchen-0068", name: "ПОКЕ С КРЕВЕТКОЙ", type: 2, priceParts: ["1050"], volume: null, description: null },
    { id: "arka-kitchen-0069", name: "ПОКЕ С ЛОСОСЕМ", type: 2, priceParts: ["1100"], volume: null, description: null },
    { id: "arka-kitchen-0070", name: "ПОКЕ С ЛОСОСЕМ СПАЙСИ", type: 2, priceParts: ["1150"], volume: null, description: null },
    { id: "arka-kitchen-0071", name: "ПОКЕ С ТУНЦОМ", type: 2, priceParts: ["990"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Римская пицца", items: [
    { id: "arka-kitchen-0072", name: "БАРВИХА", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0073", name: "МАРГАРИТА", type: 2, priceParts: ["600"], volume: null, description: null },
    { id: "arka-kitchen-0074", name: "ПЕППЕРОНИ ХАЛЯЛЬ", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0075", name: "ЦЕЗАРЬ", type: 2, priceParts: ["1190"], volume: null, description: null },
    { id: "arka-kitchen-0076", name: "ЧЕТЫРЕ СЫРА", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0077", name: "ХАЛЯЛЬ", type: 2, priceParts: ["990"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Супы", items: [
    { id: "arka-kitchen-0078", name: "БОРЩ ХАЛЯЛЬ", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0079", name: "СУП КУРИНЫЙ", type: 2, priceParts: ["590"], volume: null, description: null },
    { id: "arka-kitchen-0080", name: "ТОМ ЯМ С МОРЕПРОДУКТАМИ", type: 2, priceParts: ["1100"], volume: null, description: null },
    { id: "arka-kitchen-0081", name: "СУП ТЫКВЕННЫЙ С КРЕВЕТКАМИ", type: 2, priceParts: ["750"], volume: null, description: null },
    { id: "arka-kitchen-0082", name: "КРЕМ - СУП ГРИБНОЙ КАПУЧИНО С ДОБАВЛЕНИЕМ СЛИВОК", type: 2, priceParts: ["690"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Гарниры", items: [
    { id: "arka-kitchen-0083", name: "ОВОЩИ НА ГРИЛЕ", type: 2, priceParts: ["750"], volume: null, description: null },
    { id: "arka-kitchen-0084", name: "ГРЕЧКА С ГРИБАМИ", type: 2, priceParts: ["250"], volume: null, description: null },
    { id: "arka-kitchen-0085", name: "ПЮРЕ КАРТОФЕЛЬНОЕ СО СЛИВОЧНЫМ МАСЛОМ И МОЛОКОМ", type: 2, priceParts: ["300"], volume: null, description: null },
    { id: "arka-kitchen-0086", name: "МИНИ КАРТОФЕЛЬ", type: 2, priceParts: ["300"], volume: null, description: null },
    { id: "arka-kitchen-0087", name: "КАРТОФЕЛЬ ФРИ", type: 2, priceParts: ["390"], volume: null, description: null },
    { id: "arka-kitchen-0088", name: "БАТАТ ФРИ", type: 2, priceParts: ["490"], volume: null, description: null },
    { id: "arka-kitchen-0089", name: "РИС С ОВОЩАМИ", type: 2, priceParts: ["300"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Десерты", items: [
    { id: "arka-kitchen-0090", name: "ТИРАМИСУ", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0091", name: "ШОКОЛАДНЫЙ ФОНДАН", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0092", name: "ЧИЗКЕЙК", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0093", name: "МЕДОВИК", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0094", name: "ФРУКТОВАЯ ТАРЕЛКА", type: 2, priceParts: ["1600"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Авторская", category: "Без категории", items: [
    { id: "arka-kitchen-0095", name: "ХЛЕБ С АРОМАТНЫМ МАСЛОМ", type: 2, priceParts: ["390"], volume: null, description: "Санчес / итальянский / гречишный / бородинский" },
    { id: "arka-kitchen-0096", name: "СОУСЫ", type: 2, priceParts: ["170"], volume: null, description: "Кетчуп /  майонез свитчили / брусничный / кисло - сладкий / барбекю / блючиз / шрирача / бальзамический / перечный" },
  ] },
  { kind: 'header', sheet: "Кухня Летняя  Правильное питани", title: "Летнее предложение" },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Салаты", items: [
    { id: "arka-kitchen-0097", name: "Салат с кальмаром", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0098", name: "Салат табуле с креветками и кальмаром", type: 2, priceParts: ["1200"], volume: null, description: null },
    { id: "arka-kitchen-0099", name: "Салат из арбуза с брынзой", type: 2, priceParts: ["590"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Горячее", items: [
    { id: "arka-kitchen-0100", name: "Ньокки с кальмаром", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0101", name: "Картофель печеный с рваной говядиной", type: 2, priceParts: ["890"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Закуски", items: [
    { id: "arka-kitchen-0102", name: "Тартар из лосося", type: 2, priceParts: ["1290"], volume: null, description: null },
    { id: "arka-kitchen-0103", name: "Открытая Шаурма с курицей", type: 2, priceParts: ["790"], volume: null, description: null },
    { id: "arka-kitchen-0104", name: "Гренки из бородинского хлеба", type: 2, priceParts: ["590"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Десерты", items: [
    { id: "arka-kitchen-0105", name: "Сырники с кремом из вареной сгущенки", type: 2, priceParts: ["690"], volume: null, description: null },
    { id: "arka-kitchen-0106", name: "Арбуз", type: 2, priceParts: ["890"], volume: null, description: null },
    { id: "arka-kitchen-0107", name: "Дыня", type: 2, priceParts: ["990"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Роллы", items: [
    { id: "arka-kitchen-0108", name: "Летний ролл ассорти", type: 2, priceParts: ["1200"], volume: null, description: null },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Супы", items: [
    { id: "arka-kitchen-0109", name: "Окрошка с говядиной", type: 2, priceParts: ["790"], volume: null, description: null },
  ] },
  { kind: 'header', sheet: "Кухня Летняя  Правильное питани", title: "Правильное питание" },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Горячее", items: [
    { id: "arka-kitchen-0110", name: "СТЕЙК ЛОСОСЯ С ЛИМОНОМ", type: 2, priceParts: ["1500"], volume: null, description: "120/50г. БЖУ: 28,05 / 11,33 / 1,74. ККАЛ / БЛЮДО: 231,08." },
    { id: "arka-kitchen-0111", name: "СТЕЙК ТУНЦА С ЛИМОНОМ", type: 2, priceParts: ["1200"], volume: null, description: "120/50г. БЖУ: 27,69 / 1,73 / 2,22. ККАЛ / БЛЮДО: 160,64." },
    { id: "arka-kitchen-0112", name: "КУРИНАЯ ГРУДКА НА ПАРУ", type: 2, priceParts: ["490"], volume: "150г", description: "БЖУ: 35,4 / 2,85 / 0. ККАЛ / БЛЮДО: 169,5." },
    { id: "arka-kitchen-0113", name: "МЕДАЛЬОНЫ ИЗ ГОВЯДИНЫ НА ПАРУ", type: 2, priceParts: ["1800"], volume: "150г", description: "БЖУ: 29,7 / 3,75 / 0. ККАЛ / БЛЮДО: 157,8." },
    { id: "arka-kitchen-0114", name: "КАЛЬМАР НА ПАРУ С ЛИМОНОМ", type: 2, priceParts: ["690"], volume: null, description: "105/50г. БЖУ: 19,35 / 4,46 / 1,5. ККАЛ / БЛЮДО: 145,1." },
    { id: "arka-kitchen-0115", name: "КРЕВЕТКИ НА ПАРУ", type: 2, priceParts: ["1300"], volume: "150г", description: "БЖУ: 22,8 / 1,8 / 5,55. ККАЛ / БЛЮДО: 138." },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Гарниры", items: [
    { id: "arka-kitchen-0116", name: "ГРЕЧКА", type: 2, priceParts: ["250"], volume: "150г", description: "БЖУ: 3,38 / 0,9 / 15,37. ККАЛ / БЛЮДО: 82,8." },
    { id: "arka-kitchen-0117", name: "БРОККОЛИ НА ПАРУ", type: 2, priceParts: ["390"], volume: "127г", description: "БЖУ: 3,43 / 0,38 / 5,97. ККАЛ / БЛЮДО: 35,94." },
    { id: "arka-kitchen-0118", name: "ЦВЕТНАЯ КАПУСТА НА ПАРУ", type: 2, priceParts: ["300"], volume: "127г", description: "БЖУ: 3,05 / 0,38 / 6,1. ККАЛ / БЛЮДО: 38,1." },
    { id: "arka-kitchen-0119", name: "БРЮССЕЛЬСКАЯ КАПУСТА НА ПАРУ", type: 2, priceParts: ["250"], volume: "127г", description: "БЖУ: 6,1 / 0,51 / 10,29. ККАЛ / БЛЮДО: 59,69." },
    { id: "arka-kitchen-0120", name: "БУРЫЙ РИС", type: 2, priceParts: ["500"], volume: "150г", description: "БЖУ: 6 / 0,45 / 31,95. ККАЛ / БЛЮДО: 151,5." },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Десерты", items: [
    { id: "arka-kitchen-0121", name: "КОРОЛЕВСКИЕ ФИНИКИ", type: 2, priceParts: ["390"], volume: null, description: "2 шт. 60г. БЖУ: 1,08 / 0,3 / 44,28. ККАЛ / БЛЮДО: 166,2." },
    { id: "arka-kitchen-0122", name: "КОРОЛЕВСКИЕ ФИНИКИ С ГРЕЦКИМ ОРЕХОМ", type: 2, priceParts: ["550"], volume: "70г", description: "БЖУ: 2,46 / 6,43 / 45,3. ККАЛ / БЛЮДО: 231." },
  ] },
  { kind: 'category', sheet: "Кухня Летняя  Правильное питани", category: "Соусы", items: [
    { id: "arka-kitchen-0123", name: "ЦАЦИКИ", type: 2, priceParts: ["170"], volume: "50г", description: "БЖУ: 3,26 / 0,8 / 2,16. ККАЛ / БЛЮДО: 29,32" },
    { id: "arka-kitchen-0124", name: "ЧЕСНОЧНЫЙ", type: 2, priceParts: ["170"], volume: "50г", description: "БЖУ: 1,38 / 9,14 / 2,44. ККАЛ / БЛЮДО 98,53" },
    { id: "arka-kitchen-0125", name: "САЛЬСА", type: 2, priceParts: ["200"], volume: "50г", description: "БЖУ: 0,33 / 0,01 / 2,86. ККАЛ / БЛЮДО 12,33" },
    { id: "arka-kitchen-0126", name: "ТОМАТНЫЙ", type: 2, priceParts: ["170"], volume: "50г", description: "БЖУ: 3,67 / 1,33 / 20,45. ККАЛ / БЛЮДО 109,09" },
  ] },
];

export const ARKA_HOOKAH_SECTIONS: ArkaMenuEntry[] = [
  { kind: 'category', sheet: "Кальяны", category: "Кальянная карта", items: [
    { id: "arka-hookah-0000", name: "КАЛЬЯН НА ЧАШЕ", type: 2, priceParts: ["3700"], volume: null, description: "Чаша: классическая. Табак: любой по желанию, кроме парфюма" },
    { id: "arka-hookah-0001", name: "КАЛЬЯН НА ФРУКТЕ", type: 2, priceParts: ["4200"], volume: null, description: "Чаша: грейпфрут / ананас / гранат.  Табак : любой по желанию, кроме  парфюма" },
    { id: "arka-hookah-0002", name: "ПАРФЮМ НА ЧАШЕ", type: 2, priceParts: ["5500"], volume: null, description: "Чаша: классическая. Табак: любой по желанию, с добавлением парфюма" },
    { id: "arka-hookah-0003", name: "ПАРФЮМ НА ФРУКТЕ", type: 2, priceParts: ["6500"], volume: null, description: "Чаша: грейпфрут / ананас / гранат.  Табак : любой по желанию, с добавлением парфюма" },
    { id: "arka-hookah-0004", name: "ЭЛЕКТРОННАЯ ЧАША", type: 2, priceParts: ["4200"], volume: null, description: "Любой табак, кроме парфюма" },
    { id: "arka-hookah-0005", name: "ЭЛЕКТРОННАЯ ЧАША", type: 2, priceParts: ["5500"], volume: null, description: "Любой табак, с добавлением парфюма" },
    { id: "arka-hookah-0006", name: "КАЛЬЯН БАРВИХА", type: 2, priceParts: ["20000"], volume: null, description: "Чаша: грейпфрут / ананас / гранат.  Табак : любой по желанию. Колба: арбуз / дыня." },
  ] },
  { kind: 'category', sheet: "Кальяны", category: "Кальяная карта / Авторское предожение", items: [
    { id: "arka-hookah-0007", name: "ТРОПИКАНА МАМА", type: 2, priceParts: ["7000"], volume: null, description: "Чаша: ананас. В колбе: пюре маракуйи, ягоды малины, киви, свежая мята." },
    { id: "arka-hookah-0008", name: "ЧЁРНОЕ СОЛНЦЕ", type: 2, priceParts: ["7000"], volume: null, description: "Чаша: гранат. В колбе: ягоды ежевики, ананасовый сок, пюре лайма, чипсы апельсина, свежая мята." },
    { id: "arka-hookah-0009", name: "ЕЩЁ ОДИН, ПОЖАЛУЙСТА", type: 2, priceParts: ["7000"], volume: null, description: "Чаша: ананас. В колбе: ванильное мороженое, свежий кокос, ягоды малины, фисташки." },
    { id: "arka-hookah-0010", name: "РОЗОВАЯ ПАНТЕРА", type: 2, priceParts: ["7000"], volume: null, description: "Чаша: гранат. В колбе: ягоды малины, клубничное мороженое, рафаелло" },
    { id: "arka-hookah-0011", name: "ДОЛЬЧЕ ВИТА", type: 2, priceParts: ["7000"], volume: null, description: "Чаша: ананас. В колбе: шоколадное мороженое, печенье oreo, корица, свежая мята." },
  ] },
];


/**
 * Разворачивает секции в плоский список позиций (для перебора вне UI —
 * например, для сборки "фейковых" ResolvedMenuItem ниже).
 */
function flattenItems(sections: ArkaMenuEntry[]): ArkaMenuItem[] {
  return sections.flatMap((e) => (e.kind === 'category' ? e.items : []));
}

function parseNum(raw: string): number {
  const n = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Одна выбираемая вариация позиции (объём + своя цена + свой id для корзины). */
export interface ArkaMenuVariant {
  id: string;
  label: string | null;
  price: number;
  name: string;
  description: string | null;
}

/**
 * Единый разбор вариаций объём/цена — используется и карточками (сетка/список),
 * и toResolvedArkaBarItems() ниже, чтобы id/цены нигде не разъезжались.
 *
 * Если объёмов и цен поровну (напр. "300мл/1л" + ["650","1300"]) — каждая
 * пара становится отдельной выбираемой вариацией со своим id и названием
 * («Позиция · 300 мл» / «Позиция · 1 л»). Если не совпадает — одна вариация
 * с исходным объёмом в описании (как раньше).
 */
export function getItemVariants(item: ArkaMenuItem): ArkaMenuVariant[] {
  const volumeParts = item.volume ? item.volume.split('/').map((v) => v.trim()) : [];
  if (item.priceParts.length > 1 && volumeParts.length === item.priceParts.length) {
    return item.priceParts.map((p, i) => ({
      id: `${item.id}-v${i}`,
      label: volumeParts[i] ?? null,
      price: parseNum(p),
      name: `${item.name} · ${volumeParts[i]}`,
      description: item.description,
    }));
  }
  return [
    {
      id: item.id,
      label: item.volume,
      price: parseNum(item.priceParts.join('')),
      name: item.name,
      description: [item.volume, item.description].filter(Boolean).join('. ') || null,
    },
  ];
}

/**
 * "Фейковые" ResolvedMenuItem для тестовых позиций бара «Арки» — чтобы можно
 * было пользоваться существующей корзиной/страницей товара (/item/[itemId])
 * без правок схемы @barviha/db. Фото всегда null (реальных фото ещё нет).
 * Каждая вариация объёма — отдельная позиция в корзине/на странице товара
 * (см. getItemVariants) — без «урезания» до одной цены.
 */
export function toResolvedArkaBarItems(): import('@barviha/db').ResolvedMenuItem[] {
  return flattenItems(ARKA_BAR_SECTIONS).flatMap((item) =>
    getItemVariants(item).map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      photo: null,
      composition: null,
      category_id: null,
      price: v.price,
      weight: null,
      labels: [],
      is_available: true,
      is_premium: false,
      is_alcoholic: false,
      has_3d_model: false,
      spline_url: null,
    })),
  );
}
