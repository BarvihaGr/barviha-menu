/**
 * Переводы названий, описаний и составов блюд на EN / ZH (繁體中文) / HY (հայերեն).
 *
 * Ключ — real `item.id` из packages/db/src/menu-generated.ts.
 * Используется как fallback в pickItemName/Description/Composition (см. i18n-helpers.ts),
 * если в самой записи нет name_en / name_zh / ... .
 *
 * Бренды и имена собственные (Mojito, Corona Extra, Negroni, Americano…) намеренно
 * оставлены латиницей — для них name_* не задаём, отдаётся оригинальное item.name.
 *
 * АВТОСБОРКА из /tmp/tr.json через scripts/gen_translations (не для ручной правки построчно,
 * но править значения здесь безопасно — генератор перезапускается вручную).
 */

export interface ItemTr {
  name_en?: string;
  name_zh?: string;
  name_hy?: string;
  description_en?: string;
  description_zh?: string;
  description_hy?: string;
  composition_en?: string;
  composition_zh?: string;
  composition_hy?: string;
}

export const ITEM_TRANSLATIONS: Record<string, ItemTr> = {
  'kitchen-salads-baklazhan-tempura-s-uzbekskimi-tomatami-fistashk': {
    name_en: 'Tempura Eggplant with Uzbek Tomatoes, Pistachios & Sweet Chili',
    name_zh: '天婦羅茄子配烏茲別克番茄、開心果與甜辣醬',
    name_hy: 'Տեմպուրա սմբուկ ուզբեկական լոլիկով, պիստակով և քաղցր չիլի սոուսով',
  },
  'kitchen-salads-bolshoi-zelenyi-salat': {
    name_en: 'Big Green Salad',
    name_zh: '大份綠色沙拉',
    name_hy: 'Մեծ կանաչ աղցան',
  },
  'kitchen-salads-grecheskii': {
    name_en: 'Greek Salad',
    name_zh: '希臘沙拉',
    name_hy: 'Հունական աղցան',
  },
  'kitchen-salads-grecheskii-salat': {
    name_en: 'Greek Salad',
    name_zh: '希臘沙拉',
    name_hy: 'Հունական աղցան',
  },
  'kitchen-salads-gril-salat-s-moreproduktami-i-slivochnym-sousom-': {
    name_en: 'Grilled Seafood Salad with Dashi-Kombu Cream Sauce',
    name_zh: '燒烤海鮮沙拉配出汁昆布奶油醬',
    name_hy: 'Գրիլ ծովամթերքի աղցան դաշի-կոմբու սերուցքային սոուսով',
  },
  'kitchen-salads-klassicheskii-cezar-s-krevetkami': {
    name_en: 'Classic Caesar with Shrimp',
    name_zh: '經典凱撒沙拉配蝦',
    name_hy: 'Դասական Կեսար ծովախեցգետինով',
  },
  'kitchen-salads-klassicheskii-cezar-s-kuricei': {
    name_en: 'Classic Caesar with Chicken',
    name_zh: '經典凱撒沙拉配雞肉',
    name_hy: 'Դասական Կեսար հավով',
  },
  'kitchen-salads-olive-s-kurinoi-grudkoi': {
    name_en: 'Olivier Salad with Chicken Breast',
    name_zh: '奧利維耶沙拉配雞胸',
    name_hy: 'Օլիվյե հավի կրծքով',
  },
  'kitchen-salads-olive-so-slabosolenym-lososem': {
    name_en: 'Olivier Salad with Lightly Salted Salmon',
    name_zh: '奧利維耶沙拉配微鹽三文魚',
    name_hy: 'Օլիվյե թեթևաղ սաղմոնով',
  },
  'kitchen-salads-rukkola-s-krevetkami-klubnikoi-i-syrom-parmezan': {
    name_en: 'Arugula with Shrimp, Strawberry & Parmesan',
    name_zh: '芝麻菜配蝦、草莓與帕瑪森',
    name_hy: 'Ռուկկոլա ծովախեցգետինով, ելակով և պարմեզանով',
  },
  'kitchen-salads-salat-grecheskii': {
    name_en: 'Greek Salad',
    name_zh: '希臘沙拉',
    name_hy: 'Հունական աղցան',
  },
  'kitchen-salads-salat-po-derevenski-s-kopchenoi-smetanoi': {
    name_en: 'Country Salad with Smoked Sour Cream',
    name_zh: '鄉村沙拉配煙燻酸奶油',
    name_hy: 'Գյուղական աղցան ապխտած թթվասերով',
  },
  'kitchen-salads-salat-s-pechenoi-svekloi-i-kopchenoi-utkoi': {
    name_en: 'Salad with Baked Beetroot & Smoked Duck',
    name_zh: '烤甜菜根與煙燻鴨肉沙拉',
    name_hy: 'Աղցան թխած ճակնդեղով և ապխտած բադով',
  },
  'kitchen-salads-seviche-s-lososem': {
    name_en: 'Salmon Ceviche',
    name_zh: '三文魚酸橘汁醃魚',
    name_hy: 'Սաղմոնի սեվիչե',
  },
  'kitchen-salads-tar-tar-iz-goviadiny-klassicheskii': {
    name_en: 'Classic Beef Tartare',
    name_zh: '經典牛肉韃靼',
    name_hy: 'Դասական տավարի թարթար',
  },
  'kitchen-salads-tartar-iz-lososia': {
    name_en: 'Salmon Tartare',
    name_zh: '三文魚韃靼',
    name_hy: 'Սաղմոնի թարթար',
  },
  'kitchen-salads-tartar-iz-tunca': {
    name_en: 'Tuna Tartare',
    name_zh: '鮪魚韃靼',
    name_hy: 'Թունի թարթար',
  },
  'kitchen-salads-teplyi-salat-s-miasom-bychka-primebeef-mini-kart': {
    name_en: 'Warm Salad with Primebeef, Baby Potatoes & Tuna Sauce',
    name_zh: '溫沙拉配Primebeef牛肉、迷你馬鈴薯與鮪魚醬',
    name_hy: 'Տաք աղցան Primebeef տավարով, մինի կարտոֆիլով և թունի սոուսով',
  },
  'kitchen-salads-cezar-s-krevetkami': {
    name_en: 'Caesar with Shrimp',
    name_zh: '凱撒沙拉配蝦',
    name_hy: 'Կեսար ծովախեցգետինով',
  },
  'kitchen-salads-cezar-s-kuricei': {
    name_en: 'Caesar with Chicken',
    name_zh: '凱撒沙拉配雞肉',
    name_hy: 'Կեսար հավով',
  },
  'kitchen-cold-app-brusketta-s-lososem': {
    name_en: 'Bruschetta with Salmon',
    name_zh: '三文魚布魯斯凱塔',
    name_hy: 'Բրուսկետա սաղմոնով',
  },
  'kitchen-cold-app-brusketta-s-lososem-spaisi': {
    name_en: 'Spicy Salmon Bruschetta',
    name_zh: '香辣三文魚布魯斯凱塔',
    name_hy: 'Կծու բրուսկետա սաղմոնով',
  },
  'kitchen-cold-app-brusketta-s-rostbifom': {
    name_en: 'Bruschetta with Roast Beef',
    name_zh: '烤牛肉布魯斯凱塔',
    name_hy: 'Բրուսկետա ռոսթբիֆով',
  },
  'kitchen-cold-app-brusketty-s-lososem': {
    name_en: 'Bruschetta with Salmon',
    name_zh: '三文魚布魯斯凱塔',
    name_hy: 'Բրուսկետաներ սաղմոնով',
  },
  'kitchen-cold-app-zakuska-s-seldiu': {
    name_en: 'Herring Appetizer',
    name_zh: '鯡魚開胃菜',
    name_hy: 'Նախուտեստ ծովատառեխով',
  },
  'kitchen-cold-app-masliny-kalamata': {
    name_en: 'Kalamata Olives',
    name_zh: '卡拉馬塔橄欖',
    name_hy: 'Կալամատա ձիթապտուղ',
  },
  'kitchen-cold-app-miasnaia-tarelka': {
    name_en: 'Meat Platter',
    name_zh: '肉類拼盤',
    name_hy: 'Մսի ափսե',
  },
  'kitchen-cold-app-miasnaia-tarelka-halial': {
    name_en: 'Halal Meat Platter',
    name_zh: '清真肉類拼盤',
    name_hy: 'Հալալ մսի ափսե',
  },
  'kitchen-cold-app-ovoschnoi-set-s-sousom-bliuchiz': {
    name_en: 'Veggie Set with Blue Cheese Sauce',
    name_zh: '蔬菜拼盤配藍紋起司醬',
    name_hy: 'Բանջարեղենի սեթ բլյու չիզ սոուսով',
  },
  'kitchen-cold-app-olivki': {
    name_en: 'Olives',
    name_zh: '橄欖',
    name_hy: 'Ձիթապտուղ',
  },
  'kitchen-cold-app-syrnaia-tarelka': {
    name_en: 'Cheese Platter',
    name_zh: '起司拼盤',
    name_hy: 'Պանրի ափսե',
  },
  'kitchen-hot-app-popkorn-iz-krevetok': {
    name_en: 'Shrimp Popcorn',
    name_zh: '爆米花蝦',
    name_hy: 'Ծովախեցգետնի փոփքորն',
  },
  'kitchen-hot-app-popkorn-iz-kuricy': {
    name_en: 'Chicken Popcorn',
    name_zh: '爆米花雞',
    name_hy: 'Հավի փոփքորն',
  },
  'kitchen-hot-app-syrnye-palochki-s-brusnichnym-sousom': {
    name_en: 'Cheese Sticks with Lingonberry Sauce',
    name_zh: '起司條配越橘醬',
    name_hy: 'Պանրի ձողիկներ լոռամրգի սոուսով',
  },
  'kitchen-soups-borsch-halial': {
    name_en: 'Halal Borscht',
    name_zh: '清真羅宋湯',
    name_hy: 'Հալալ բորշ',
  },
  'kitchen-soups-krem-sup-gribnoi-kapuchino-s-dobavleniem-slivok': {
    name_en: 'Mushroom Cappuccino Cream Soup',
    name_zh: '蘑菇卡布奇諾奶油濃湯',
    name_hy: 'Սնկի կապուչինո կրեմ-ապուր սերուցքով',
  },
  'kitchen-soups-sup-kurinyi': {
    name_en: 'Chicken Soup',
    name_zh: '雞湯',
    name_hy: 'Հավի ապուր',
  },
  'kitchen-soups-sup-tykvennyi-s-krevetkami': {
    name_en: 'Pumpkin Soup with Shrimp',
    name_zh: '南瓜湯配蝦',
    name_hy: 'Դդումի ապուր ծովախեցգետինով',
  },
  'kitchen-soups-syrnyi-sup-s-grissini': {
    name_en: 'Cheese Soup with Grissini',
    name_zh: '起司湯配麵包棒',
    name_hy: 'Պանրի ապուր գրիսսինիով',
  },
  'kitchen-soups-tom-iam-s-moreproduktami': {
    name_en: 'Tom Yum with Seafood',
    name_zh: '海鮮冬蔭功',
    name_hy: 'Թոմ Յամ ծովամթերքով',
  },
  'kitchen-soups-tom-iam-s-moreproduktami-2': {
    name_en: 'Tom Yum with Seafood',
    name_zh: '海鮮冬蔭功',
    name_hy: 'Թոմ Յամ ծովամթերքով',
  },
  'kitchen-pasta-karbonara': {
    name_en: 'Carbonara',
    name_zh: '卡邦尼義大利麵',
    name_hy: 'Կարբոնարա',
  },
  'kitchen-pasta-lapsha-s-kuricei-i-krevetkami-v-souse-kokosovyi-': {
    name_en: 'Noodles with Chicken & Shrimp in Coconut Wok & Bonito Sauce',
    name_zh: '椰香炒雞肉鮮蝦麵配柴魚',
    name_hy: 'Արիշտա հավով և ծովախեցգետինով կոկոսի վոկ և բոնիտո սոուսով',
  },
  'kitchen-pasta-lingvini-karbonara': {
    name_en: 'Linguine Carbonara',
    name_zh: '細扁麵卡邦尼',
    name_hy: 'Լինգվինի կարբոնարա',
  },
  'kitchen-pasta-pappardelle-s-lososem-i-krasnoi-ikroi': {
    name_en: 'Pappardelle with Salmon & Red Caviar',
    name_zh: '寬麵配三文魚與紅魚子',
    name_hy: 'Պապարդելե սաղմոնով և կարմիր խավիարով',
  },
  'kitchen-pasta-penne-s-rostbifom-v-triufelnom-souse': {
    name_en: 'Penne with Roast Beef in Truffle Sauce',
    name_zh: '松露醬烤牛肉筆管麵',
    name_hy: 'Պեննե ռոսթբիֆով թրյուֆելի սոուսով',
  },
  'kitchen-pasta-fetuchini-s-kurinym-bedrom-teriiaki': {
    name_en: 'Fettuccine with Teriyaki Chicken Thigh',
    name_zh: '照燒雞腿義大利寬麵',
    name_hy: 'Ֆետուչինի տերիյակի հավի ազդրով',
  },
  'kitchen-pizza-barviha': {
    name_en: 'Barvikha',
    name_zh: '巴爾維哈',
    name_hy: 'Բարվիխա',
  },
  'kitchen-pizza-pepperoni-halial': {
    name_en: 'Pepperoni Halal',
    name_zh: '清真臘腸披薩',
    name_hy: 'Պեպերոնի հալալ',
  },
  'kitchen-pizza-picca-4-syra': {
    name_en: 'Four Cheese Pizza',
    name_zh: '四起司披薩',
    name_hy: 'Չորս պանրի պիցցա',
  },
  'kitchen-pizza-picca-margarita': {
    name_en: 'Margherita Pizza',
    name_zh: '瑪格麗特披薩',
    name_hy: 'Մարգարիտա պիցցա',
  },
  'kitchen-pizza-halial': {
    name_en: 'Halal',
    name_zh: '清真',
    name_hy: 'Հալալ',
  },
  'kitchen-pizza-cezar': {
    name_en: 'Caesar',
    name_zh: '凱撒',
    name_hy: 'Կեսար',
  },
  'kitchen-hot-befstroganov-s-kartofelnym-piure': {
    name_en: 'Beef Stroganoff with Mashed Potatoes',
    name_zh: '俄式牛柳配馬鈴薯泥',
    name_hy: 'Բեֆստրոգանով կարտոֆիլի պյուրեով',
  },
  'kitchen-hot-brisket-s-kartofelnym-piure-i-sousom-iz-tykvy': {
    name_en: 'Brisket with Mashed Potatoes & Pumpkin Sauce',
    name_zh: '牛胸肉配馬鈴薯泥與南瓜醬',
    name_hy: 'Բրիսկետ կարտոֆիլի պյուրեով և դդումի սոուսով',
  },
  'kitchen-hot-goviadina-v-aziatskom-stile-s-risom': {
    name_en: 'Asian-Style Beef with Rice',
    name_zh: '亞洲風味牛肉飯',
    name_hy: 'Տավար ասիական ոճով բրնձով',
  },
  'kitchen-hot-goviazhi-rebra-kopchenye-s-sousom-iz-elovyh-shis': {
    name_en: 'Smoked Beef Ribs with Pinecone Sauce',
    name_zh: '煙燻牛肋配松果醬',
    name_hy: 'Ապխտած տավարի կողիկներ եղևնու կոներով սոուսով',
  },
  'kitchen-hot-grechka-s-krevetkami': {
    name_en: 'Buckwheat with Shrimp',
    name_zh: '蕎麥配蝦',
    name_hy: 'Հնդկաձավար ծովախեցգետինով',
  },
  'kitchen-hot-kasha-iz-topora': {
    name_en: '"Axe" Porridge (Buckwheat with Beef)',
    name_zh: '斧頭粥（蕎麥燉牛肉）',
    name_hy: '«Կացնից շիլա» (հնդկաձավար տավարով)',
  },
  'kitchen-hot-kotletki-iz-indeiki-s-kartofelnym-piure-i-sousom': {
    name_en: 'Turkey Cutlets with Mashed Potatoes & Sauce',
    name_zh: '火雞肉餅配馬鈴薯泥與醬汁',
    name_hy: 'Հնդկահավի կոտլետներ կարտոֆիլի պյուրեով և սոուսով',
  },
  'kitchen-hot-kurinoe-bedro-s-bulgurom': {
    name_en: 'Chicken Thigh with Bulgur',
    name_zh: '雞腿配布格麥',
    name_hy: 'Հավի ազդր բուլղուրով',
  },
  'kitchen-hot-kurinyi-steik-tanduri-s-briusselskoi-kapustoi-i-': {
    name_en: 'Tandoori Chicken Steak with Brussels Sprouts & Cherry Tomatoes',
    name_zh: '坦都里雞排配孢子甘藍與小番茄',
    name_hy: 'Տանդուրի հավի սթեյք բրյուսելյան կաղամբով և չերի լոլիկով',
  },
  'kitchen-hot-steik-iz-lososia-so-shpinatom-i-shampinonami': {
    name_en: 'Salmon Steak with Spinach & Mushrooms',
    name_zh: '三文魚排配菠菜與蘑菇',
    name_hy: 'Սաղմոնի սթեյք սպանախով և շամպինիոնով',
  },
  'kitchen-hot-steik-ribai': {
    name_en: 'Ribeye Steak',
    name_zh: '肋眼牛排',
    name_hy: 'Ռիբայ սթեյք',
  },
  'kitchen-hot-cyplenok-na-grile-s-uzbekskimi-tomatami': {
    name_en: 'Grilled Spring Chicken with Uzbek Tomatoes',
    name_zh: '烤春雞配烏茲別克番茄',
    name_hy: 'Գրիլ ճտիկ ուզբեկական լոլիկով',
  },
  'kitchen-hot-shnicel-kurinyi': {
    name_en: 'Chicken Schnitzel',
    name_zh: '炸雞排',
    name_hy: 'Հավի շնիցել',
  },
  'kitchen-hot-schechki-bychka-s-kartofelnym-piure-s-sousom-kog': {
    name_en: 'Beef Cheeks with Mashed Potatoes & Kogi Sauce',
    name_zh: '燉牛頰肉配馬鈴薯泥與Kogi醬',
    name_hy: 'Տավարի այտեր կարտոֆիլի պյուրեով և կոգի սոուսով',
  },
  'kitchen-steaks-steik-denver': {
    name_en: 'Denver Steak',
    name_zh: '丹佛牛排',
    name_hy: 'Դենվեր սթեյք',
  },
  'kitchen-steaks-steik-minon': {
    name_en: 'Filet Mignon',
    name_zh: '菲力牛排',
    name_hy: 'Ֆիլե մինյոն',
  },
  'kitchen-steaks-steik-striploin': {
    name_en: 'Striploin Steak',
    name_zh: '西冷牛排',
    name_hy: 'Սթրիփլոյն սթեյք',
  },
  'kitchen-burgers-burger-barviha-s-dvoinoi-kotletoi-koniachnym-sou': {
    name_en: '"Barvikha" Burger with Double Patty, Cognac Sauce & Porcini Cream',
    name_zh: '「巴爾維哈」雙層牛肉堡配干邑醬與牛肝菌奶油',
    name_hy: '«Բարվիխա» բուրգեր կրկնակի կոտլետով, կոնյակի սոուսով և սպիտակ սնկի կրեմով',
  },
  'kitchen-burgers-burger-klassika-s-kotletoi-iz-mramornoi-goviadin': {
    name_en: '"Classic" Burger with Marbled Beef Patty & Honey-Mustard Sauce',
    name_zh: '「經典」大理石牛肉堡配蜂蜜芥末醬',
    name_hy: '«Կլասիկա» բուրգեր մարմարյա տավարի կոտլետով և մեղր-մանանեխ սոուսով',
  },
  'kitchen-burgers-burger-syrnyi-s-kotletoi-iz-mramornoi-goviadiny-': {
    name_en: '"Cheese" Burger with Marbled Beef Patty, Bacon & Egg',
    name_zh: '「起司」大理石牛肉堡配培根與蛋',
    name_hy: '«Պանրային» բուրգեր մարմարյա տավարի կոտլետով, բեկոնով և ձվով',
  },
  'kitchen-burgers-burger-barviha-s-dvoinoi-kotletoi-koniachnym-sou-2': {
    name_en: 'Barvikha Burger with Double Patty, Cognac Sauce & Porcini Cream',
    name_zh: '巴爾維哈雙層牛肉堡配干邑醬與牛肝菌奶油',
    name_hy: 'Բուրգեր Բարվիխա կրկնակի կոտլետով, կոնյակի սոուսով և սպիտակ սնկի կրեմով',
  },
  'kitchen-burgers-burger-s-kamamberom-goviadinoi-i-brusnichnym-sou': {
    name_en: 'Burger with Camembert, Beef & Lingonberry Sauce',
    name_zh: '卡門貝爾牛肉堡配越橘醬',
    name_hy: 'Բուրգեր կամամբերով, տավարով և լոռամրգի սոուսով',
  },
  'kitchen-burgers-burger-s-rvanoi-goviadinoi-mango-i-halapeno': {
    name_en: 'Burger with Pulled Beef, Mango & Jalapeño',
    name_zh: '手撕牛肉堡配芒果與墨西哥辣椒',
    name_hy: 'Բուրգեր քաշված տավարով, մանգոյով և խալապենյոյով',
  },
  'kitchen-burgers-burger-s-hrustiaschim-cyplenkom': {
    name_en: 'Crispy Chicken Burger',
    name_zh: '酥脆雞肉堡',
    name_hy: 'Բուրգեր խրթխրթան ճտով',
  },
  'kitchen-burgers-halial-burger-klassika-s-kotletoi-iz-mramornoi-g': {
    name_en: 'Halal "Classic" Burger with Marbled Beef Patty & Honey-Mustard Sauce',
    name_zh: '清真「經典」大理石牛肉堡配蜂蜜芥末醬',
    name_hy: 'Հալալ «Կլասիկա» բուրգեր մարմարյա տավարի կոտլետով և մեղր-մանանեխ սոուսով',
  },
  'kitchen-rolls-gunkan-kani': {
    name_en: 'Gunkan Kani',
    name_zh: '蟹肉軍艦卷',
    name_hy: 'Գունկան կանի',
  },
  'kitchen-rolls-gunkan-maguro': {
    name_en: 'Gunkan Maguro',
    name_zh: '鮪魚軍艦卷',
    name_hy: 'Գունկան մագուրո',
  },
  'kitchen-rolls-gunkan-siake': {
    name_en: 'Gunkan Sake (Salmon)',
    name_zh: '三文魚軍艦卷',
    name_hy: 'Գունկան սյակե',
  },
  'kitchen-rolls-kaliforniia-s-krevetkoi': {
    name_en: 'California with Shrimp',
    name_zh: '加州卷配蝦',
    name_hy: 'Կալիֆորնիա ծովախեցգետինով',
  },
  'kitchen-rolls-kaliforniia-s-lososem': {
    name_en: 'California with Salmon',
    name_zh: '加州卷配三文魚',
    name_hy: 'Կալիֆորնիա սաղմոնով',
  },
  'kitchen-rolls-roll-barviha': {
    name_en: 'Barvikha Roll',
    name_zh: '巴爾維哈卷',
    name_hy: 'Ռոլլ Բարվիխա',
  },
  'kitchen-rolls-roll-kaliforniia-s-krabom': {
    name_en: 'California Roll with Crab',
    name_zh: '蟹肉加州卷',
    name_hy: 'Կալիֆորնիա ռոլլ կրաբով',
  },
  'kitchen-rolls-roll-kaliforniia-s-krevetkoi': {
    name_en: 'California Roll with Shrimp',
    name_zh: '鮮蝦加州卷',
    name_hy: 'Կալիֆորնիա ռոլլ ծովախեցգետինով',
  },
  'kitchen-rolls-roll-kaliforniia-s-lososem': {
    name_en: 'California Roll with Salmon',
    name_zh: '三文魚加州卷',
    name_hy: 'Կալիֆորնիա ռոլլ սաղմոնով',
  },
  'kitchen-rolls-roll-krevetka-losos': {
    name_en: 'Shrimp & Salmon Roll',
    name_zh: '鮮蝦三文魚卷',
    name_hy: 'Ռոլլ ծովախեցգետին-սաղմոն',
  },
  'kitchen-rolls-roll-krevetka-tempura': {
    name_en: 'Shrimp Tempura Roll',
    name_zh: '天婦羅蝦卷',
    name_hy: 'Ռոլլ ծովախեցգետին տեմպուրա',
  },
  'kitchen-rolls-roll-opalenyi-losos-s-apelsinom': {
    name_en: 'Seared Salmon Roll with Orange',
    name_zh: '炙燒三文魚柳橙卷',
    name_hy: 'Ռոլլ խորոված սաղմոն նարնջով',
  },
  'kitchen-rolls-roll-s-avokado-i-lososem': {
    name_en: 'Roll with Avocado & Salmon',
    name_zh: '牛油果三文魚卷',
    name_hy: 'Ռոլլ ավոկադոյով և սաղմոնով',
  },
  'kitchen-rolls-roll-filadelfiia': {
    name_en: 'Philadelphia Roll',
    name_zh: '費城卷',
    name_hy: 'Ֆիլադելֆիա ռոլլ',
  },
  'kitchen-rolls-teplyi-roll-s-krevetkoi-i-lososem': {
    name_en: 'Warm Roll with Shrimp & Salmon',
    name_zh: '溫熱鮮蝦三文魚卷',
    name_hy: 'Տաք ռոլլ ծովախեցգետինով և սաղմոնով',
  },
  'kitchen-rolls-filadelfiia': {
    name_en: 'Philadelphia',
    name_zh: '費城卷',
    name_hy: 'Ֆիլադելֆիա',
  },
  'kitchen-poke-poke-s-krevetkoi': {
    name_en: 'Poke with Shrimp',
    name_zh: '鮮蝦夏威夷蓋飯',
    name_hy: 'Պոկե ծովախեցգետինով',
  },
  'kitchen-poke-poke-s-lososem': {
    name_en: 'Poke with Salmon',
    name_zh: '三文魚夏威夷蓋飯',
    name_hy: 'Պոկե սաղմոնով',
  },
  'kitchen-poke-poke-s-lososem-spaisi': {
    name_en: 'Spicy Salmon Poke',
    name_zh: '香辣三文魚蓋飯',
    name_hy: 'Կծու պոկե սաղմոնով',
  },
  'kitchen-poke-poke-s-tuncom': {
    name_en: 'Poke with Tuna',
    name_zh: '鮪魚夏威夷蓋飯',
    name_hy: 'Պոկե թունով',
  },
  'kitchen-sides-batat-fri': {
    name_en: 'Sweet Potato Fries',
    name_zh: '炸地瓜條',
    name_hy: 'Բատատ ֆրի',
  },
  'kitchen-sides-grechka-s-gribami': {
    name_en: 'Buckwheat with Mushrooms',
    name_zh: '蘑菇蕎麥',
    name_hy: 'Հնդկաձավար սնկով',
  },
  'kitchen-sides-kartofel-fri': {
    name_en: 'French Fries',
    name_zh: '薯條',
    name_hy: 'Կարտոֆիլ ֆրի',
  },
  'kitchen-sides-mini-kartofel': {
    name_en: 'Baby Potatoes',
    name_zh: '迷你馬鈴薯',
    name_hy: 'Մինի կարտոֆիլ',
  },
  'kitchen-sides-narezka-limon-laim': {
    name_en: 'Lemon / Lime Slices',
    name_zh: '檸檬／青檸切片',
    name_hy: 'Կիտրոն/լայմ կտրատած',
  },
  'kitchen-sides-ovoschi-gril': {
    name_en: 'Grilled Vegetables',
    name_zh: '烤蔬菜',
    name_hy: 'Գրիլ բանջարեղեն',
  },
  'kitchen-sides-ovoschi-na-grile': {
    name_en: 'Grilled Vegetables',
    name_zh: '烤蔬菜',
    name_hy: 'Գրիլ բանջարեղեն',
  },
  'kitchen-sides-piure-kartofelnoe-so-slivochnym-maslom-i-molokom': {
    name_en: 'Mashed Potatoes with Butter & Milk',
    name_zh: '奶油牛奶馬鈴薯泥',
    name_hy: 'Կարտոֆիլի պյուրե կարագով և կաթով',
  },
  'kitchen-sides-ris-s-ovoschami': {
    name_en: 'Rice with Vegetables',
    name_zh: '蔬菜飯',
    name_hy: 'Բրինձ բանջարեղենով',
  },
  'kitchen-sides-shashlyk-iz-baraniny': {
    name_en: 'Lamb Skewers',
    name_zh: '羊肉串',
    name_hy: 'Գառան շաշլիկ',
  },
  'kitchen-sides-shashlyk-iz-goviazhei-vyrezki': {
    name_en: 'Beef Tenderloin Skewers',
    name_zh: '牛柳串',
    name_hy: 'Տավարի փափուկ մսից շաշլիկ',
  },
  'kitchen-sides-shashlyk-iz-kurinogo-bedra': {
    name_en: 'Chicken Thigh Skewers',
    name_zh: '雞腿串',
    name_hy: 'Հավի ազդրից շաշլիկ',
  },
  'kitchen-desserts-brauni': {
    name_en: 'Brownie',
    name_zh: '布朗尼',
    name_hy: 'Բրաունի',
  },
  'kitchen-desserts-medovik': {
    name_en: 'Medovik (Honey Cake)',
    name_zh: '蜂蜜千層蛋糕',
    name_hy: 'Մեդովիկ (մեղրով տորթ)',
  },
  'kitchen-desserts-medovik-originalnyi': {
    name_en: 'Original Medovik',
    name_zh: '原味蜂蜜蛋糕',
    name_hy: 'Մեդովիկ օրիգինալ',
  },
  'kitchen-desserts-morkovnyi': {
    name_en: 'Carrot Cake',
    name_zh: '胡蘿蔔蛋糕',
    name_hy: 'Գազարով տորթ',
  },
  'kitchen-desserts-niu-iork': {
    name_en: 'New York Cheesecake',
    name_zh: '紐約起司蛋糕',
    name_hy: 'Նյու-Յորք չիզքեյք',
  },
  'kitchen-desserts-sinnokeik': {
    name_en: 'Cinnocake',
    name_zh: '肉桂蛋糕',
    name_hy: 'Սիննոքեյք',
  },
  'kitchen-desserts-smetannik': {
    name_en: 'Smetannik (Sour Cream Cake)',
    name_zh: '酸奶油蛋糕',
    name_hy: 'Սմետաննիկ',
  },
  'kitchen-desserts-tiramisu': {
    name_en: 'Tiramisu',
    name_zh: '提拉米蘇',
    name_hy: 'Տիրամիսու',
  },
  'kitchen-desserts-tri-shokolada': {
    name_en: 'Three Chocolate',
    name_zh: '三重巧克力',
    name_hy: 'Երեք շոկոլադ',
  },
  'kitchen-desserts-fistashkovyi': {
    name_en: 'Pistachio Cake',
    name_zh: '開心果蛋糕',
    name_hy: 'Պիստակով տորթ',
  },
  'kitchen-desserts-fruktovaia-tarelka': {
    name_en: 'Fruit Platter',
    name_zh: '水果拼盤',
    name_hy: 'Մրգի ափսե',
  },
  'kitchen-desserts-chizkeik': {
    name_en: 'Cheesecake',
    name_zh: '起司蛋糕',
    name_hy: 'Չիզքեյք',
  },
  'kitchen-desserts-chizkeik-klubnichnyi': {
    name_en: 'Strawberry Cheesecake',
    name_zh: '草莓起司蛋糕',
    name_hy: 'Ելակով չիզքեյք',
  },
  'kitchen-desserts-shokoladnyi-fondan': {
    name_en: 'Chocolate Fondant',
    name_zh: '熔岩巧克力蛋糕',
    name_hy: 'Շոկոլադե ֆոնդան',
  },
  'kitchen-snacks-arahis-solenyi': {
    name_en: 'Salted Peanuts',
    name_zh: '鹹花生',
    name_hy: 'Աղած գետնանուշ',
  },
  'kitchen-snacks-vialenoe-miaso': {
    name_en: 'Cured Meat',
    name_zh: '風乾肉',
    name_hy: 'Չորացրած միս',
  },
  'kitchen-snacks-keshiu-v-speciiah': {
    name_en: 'Spiced Cashews',
    name_zh: '香料腰果',
    name_hy: 'Համեմունքով հնդկական ընկույզ',
  },
  'kitchen-snacks-miks-oreshki-v-speciiah': {
    name_en: 'Spiced Mixed Nuts',
    name_zh: '香料綜合堅果',
    name_hy: 'Համեմունքով ընկույզի միքս',
  },
  'kitchen-snacks-mindal-v-speciiah': {
    name_en: 'Spiced Almonds',
    name_zh: '香料杏仁',
    name_hy: 'Համեմունքով նուշ',
  },
  'kitchen-snacks-mindal-v-shokolade-triufel': {
    name_en: 'Chocolate-Truffle Almonds',
    name_zh: '松露巧克力杏仁',
    name_hy: 'Նուշ շոկոլադե թրյուֆելով',
  },
  'kitchen-snacks-fistashka': {
    name_en: 'Pistachios',
    name_zh: '開心果',
    name_hy: 'Պիստակ',
  },
  'kitchen-snacks-fistashki': {
    name_en: 'Pistachios',
    name_zh: '開心果',
    name_hy: 'Պիստակ',
  },
  'kitchen-snacks-funduk-v-molochnom-shokolade': {
    name_en: 'Hazelnuts in Milk Chocolate',
    name_zh: '牛奶巧克力榛果',
    name_hy: 'Պնդուկ կաթնային շոկոլադով',
  },
  'kitchen-snacks-chipsy': {
    name_en: 'Chips',
    name_zh: '薯片',
    name_hy: 'Չիպս',
  },
  'kitchen-snacks-shariki': {
    name_en: 'Crispy Balls',
    name_zh: '脆球',
    name_hy: 'Խրթխրթան գնդիկներ',
  },
  'kitchen-healthy-brokkoli-na-paru': {
    name_en: 'Steamed Broccoli',
    name_zh: '清蒸西蘭花',
    name_hy: 'Շոգեխաշած բրոկկոլի',
  },
  'kitchen-healthy-briusselskaia-kapusta-na-paru': {
    name_en: 'Steamed Brussels Sprouts',
    name_zh: '清蒸孢子甘藍',
    name_hy: 'Շոգեխաշած բրյուսելյան կաղամբ',
  },
  'kitchen-healthy-grechka': {
    name_en: 'Buckwheat',
    name_zh: '蕎麥',
    name_hy: 'Հնդկաձավար',
  },
  'kitchen-healthy-kalmar-na-paru-s-limonom': {
    name_en: 'Steamed Squid with Lemon',
    name_zh: '檸檬清蒸魷魚',
    name_hy: 'Շոգեխաշած կաղամար կիտրոնով',
  },
  'kitchen-healthy-korolevskie-finiki': {
    name_en: 'Royal Dates',
    name_zh: '帝王椰棗',
    name_hy: 'Արքայական արմավ',
  },
  'kitchen-healthy-korolevskie-finiki-s-greckim-orehom': {
    name_en: 'Royal Dates with Walnuts',
    name_zh: '核桃帝王椰棗',
    name_hy: 'Արքայական արմավ ընկույզով',
  },
  'kitchen-healthy-krevetki-na-paru': {
    name_en: 'Steamed Shrimp',
    name_zh: '清蒸蝦',
    name_hy: 'Շոգեխաշած ծովախեցգետին',
  },
  'kitchen-healthy-kurinaia-grudka-na-paru': {
    name_en: 'Steamed Chicken Breast',
    name_zh: '清蒸雞胸',
    name_hy: 'Շոգեխաշած հավի կրծք',
  },
  'kitchen-healthy-medalony-iz-goviadiny-na-paru': {
    name_en: 'Steamed Beef Medallions',
    name_zh: '清蒸牛肉小排',
    name_hy: 'Շոգեխաշած տավարի մեդալյոններ',
  },
  'kitchen-healthy-steik-lososia-s-limonom': {
    name_en: 'Salmon Steak with Lemon',
    name_zh: '檸檬三文魚排',
    name_hy: 'Սաղմոնի սթեյք կիտրոնով',
  },
  'kitchen-healthy-steik-tunca-s-limonom': {
    name_en: 'Tuna Steak with Lemon',
    name_zh: '檸檬鮪魚排',
    name_hy: 'Թունի սթեյք կիտրոնով',
  },
  'kitchen-healthy-cvetnaia-kapusta-na-paru': {
    name_en: 'Steamed Cauliflower',
    name_zh: '清蒸花椰菜',
    name_hy: 'Շոգեխաշած ծաղկակաղամբ',
  },
  'kitchen-lenten-roll-ovoschnoi': {
    name_en: 'Vegetable Roll',
    name_zh: '蔬菜卷',
    name_hy: 'Բանջարեղենային ռոլլ',
  },
  'kitchen-lenten-salat-so-shpinatom-kinoa-seldereem-i-iablokom': {
    name_en: 'Salad with Spinach, Quinoa, Celery & Apple',
    name_zh: '菠菜藜麥芹菜蘋果沙拉',
    name_hy: 'Աղցան սպանախով, կինոայով, նեխուրով և խնձորով',
  },
  'kitchen-lenten-sup-iz-korneplodov': {
    name_en: 'Root Vegetable Soup',
    name_zh: '根莖蔬菜湯',
    name_hy: 'Արմատապտուղների ապուր',
  },
  'kitchen-lenten-cvetnaia-kapusta-s-sousom-na-osnove-kokosovogo-m': {
    name_en: 'Cauliflower with Coconut Curry Sauce',
    name_zh: '椰漿咖哩花椰菜',
    name_hy: 'Ծաղկակաղամբ կոկոսի կարի սոուսով',
  },
  'kitchen-seasonal-bulgur-s-utkoi-i-sousom-demiglas': {
    name_en: 'Bulgur with Duck & Demi-Glace Sauce',
    name_zh: '鴨肉布格麥配半釉汁',
    name_hy: 'Բուլղուր բադով և դեմիգլաս սոուսով',
  },
  'kitchen-seasonal-zhulen-s-moreproduktami': {
    name_en: 'Seafood Julienne',
    name_zh: '海鮮焗烤',
    name_hy: 'Ծովամթերքով ժյուլեն',
  },
  'kitchen-seasonal-zakuska-s-pashtetom-iz-goviazhei-pecheni': {
    name_en: 'Beef Liver Pâté Appetizer',
    name_zh: '牛肝醬開胃菜',
    name_hy: 'Նախուտեստ տավարի լյարդի պաշտետով',
  },
  'kitchen-seasonal-krem-briule': {
    name_en: 'Crème Brûlée',
    name_zh: '焦糖布丁',
    name_hy: 'Կրեմ-բրյուլե',
  },
  'kitchen-seasonal-orzo-s-rostbifom': {
    name_en: 'Orzo with Roast Beef',
    name_zh: '烤牛肉米型麵',
    name_hy: 'Օրզո ռոսթբիֆով',
  },
  'kitchen-seasonal-roll-s-batatom': {
    name_en: 'Roll with Sweet Potato',
    name_zh: '地瓜卷',
    name_hy: 'Ռոլլ բատատով',
  },
  'kitchen-seasonal-roll-s-zharenym-lososem': {
    name_en: 'Roll with Fried Salmon',
    name_zh: '煎三文魚卷',
    name_hy: 'Ռոլլ տապակած սաղմոնով',
  },
  'kitchen-seasonal-roll-s-tuncom': {
    name_en: 'Roll with Tuna',
    name_zh: '鮪魚卷',
    name_hy: 'Ռոլլ թունով',
  },
  'kitchen-seasonal-salat-s-tuncom-i-triufelnoi-zapravkoi': {
    name_en: 'Salad with Tuna & Truffle Dressing',
    name_zh: '鮪魚松露沙拉',
    name_hy: 'Աղցան թունով և թրյուֆելի սոուսով',
  },
  'kitchen-seasonal-steik-iz-goviazhei-pecheni': {
    name_en: 'Beef Liver Steak',
    name_zh: '牛肝排',
    name_hy: 'Տավարի լյարդի սթեյք',
  },
  'kitchen-seasonal-tomaty-kimchi': {
    name_en: 'Kimchi Tomatoes',
    name_zh: '泡菜番茄',
    name_hy: 'Կիմչի լոլիկ',
  },
  'bar-teas-aloe-end-guzberri': {
    name_en: 'Aloe & Gooseberry',
    name_zh: '蘆薈與醋栗',
    name_hy: 'Ալոե և կռիժովնիկ',
  },
  'bar-teas-ananas-oblepiha-med-liui-ia-bao': {
    name_en: 'Pineapple, Sea Buckthorn, Honey, Lü Ya Bao',
    name_zh: '鳳梨、沙棘、蜂蜜、綠芽寶',
    name_hy: 'Արքայախնձոր, չիչխան, մեղր, Լյույ Յա Բաո',
  },
  'bar-teas-vinogradnyi-glintvein': {
    name_en: 'Grape Mulled Drink',
    name_zh: '葡萄熱飲',
    name_hy: 'Խաղողի գլինտվեյն',
  },
  'bar-teas-vishnia-klubnika-limon': {
    name_en: 'Cherry, Strawberry, Lemon',
    name_zh: '櫻桃、草莓、檸檬',
    name_hy: 'Բալ, ելակ, կիտրոն',
  },
  'bar-teas-vishnia-karkade-shu-puer': {
    name_en: 'Cherry, Hibiscus, Shou Puer',
    name_zh: '櫻桃、洛神花、熟普洱',
    name_hy: 'Բալ, կարկադե, շու պուեր',
  },
  'bar-teas-greipfrut-i-klubnika': {
    name_en: 'Grapefruit & Strawberry',
    name_zh: '西柚與草莓',
    name_hy: 'Գրեյպֆրուտ և ելակ',
  },
  'bar-teas-grusha-vanil-korica': {
    name_en: 'Pear, Vanilla, Cinnamon',
    name_zh: '梨、香草、肉桂',
    name_hy: 'Տանձ, վանիլ, դարչին',
  },
  'bar-teas-da-hun-pao-i-persik': {
    name_en: 'Da Hong Pao & Peach',
    name_zh: '大紅袍與桃子',
    name_hy: 'Դա Հուն Պաո և դեղձ',
  },
  'bar-teas-ezhevika-i-grusha': {
    name_en: 'Blackberry & Pear',
    name_zh: '黑莓與梨',
    name_hy: 'Մոշ և տանձ',
  },
  'bar-teas-imbir-i-limon': {
    name_en: 'Ginger & Lemon',
    name_zh: '薑與檸檬',
    name_hy: 'Կոճապղպեղ և կիտրոն',
  },
  'bar-teas-imbir-limon-malina': {
    name_en: 'Ginger, Lemon, Raspberry',
    name_zh: '薑、檸檬、覆盆莓',
    name_hy: 'Կոճապղպեղ, կիտրոն, ազնվամորի',
  },
  'bar-teas-kivi-i-klubnika': {
    name_en: 'Kiwi & Strawberry',
    name_zh: '奇異果與草莓',
    name_hy: 'Կիվի և ելակ',
  },
  'bar-teas-kivi-i-iabloko': {
    name_en: 'Kiwi & Apple',
    name_zh: '奇異果與蘋果',
    name_hy: 'Կիվի և խնձոր',
  },
  'bar-teas-klubnika-i-bazilik': {
    name_en: 'Strawberry & Basil',
    name_zh: '草莓與羅勒',
    name_hy: 'Ելակ և ռեհան',
  },
  'bar-teas-klubnika-i-malina': {
    name_en: 'Strawberry & Raspberry',
    name_zh: '草莓與覆盆莓',
    name_hy: 'Ելակ և ազնվամորի',
  },
  'bar-teas-lesnye-iagody': {
    name_en: 'Wild Berries',
    name_zh: '野莓',
    name_hy: 'Անտառային հատապտուղներ',
  },
  'bar-teas-mango-i-marakuiia': {
    name_en: 'Mango & Passion Fruit',
    name_zh: '芒果與百香果',
    name_hy: 'Մանգո և մարակույա',
  },
  'bar-teas-mandarin-bazilik-prianosti': {
    name_en: 'Mandarin, Basil, Spices',
    name_zh: '柑橘、羅勒、香料',
    name_hy: 'Մանդարին, ռեհան, համեմունքներ',
  },
  'bar-teas-marokkanskii-chai': {
    name_en: 'Moroccan Tea',
    name_zh: '摩洛哥茶',
    name_hy: 'Մարոկկական թեյ',
  },
  'bar-teas-masala': {
    name_en: 'Masala Tea',
    name_zh: '瑪薩拉茶',
    name_hy: 'Մասալա թեյ',
  },
  'bar-teas-oblepiha-imbir-med': {
    name_en: 'Sea Buckthorn, Ginger, Honey',
    name_zh: '沙棘、薑、蜂蜜',
    name_hy: 'Չիչխան, կոճապղպեղ, մեղր',
  },
  'bar-teas-sliva-marakuiia-sagan-dailia': {
    name_en: 'Plum, Passion Fruit, Saган-Dalya',
    name_zh: '李子、百香果、薩根達雅',
    name_hy: 'Սալոր, մարակույա, սագան-դայլա',
  },
  'bar-teas-chernaia-smorodina': {
    name_en: 'Blackcurrant',
    name_zh: '黑加侖',
    name_hy: 'Սև հաղարջ',
  },
  'bar-coffee-amerikano': {
    name_en: 'Americano',
    name_zh: '美式咖啡',
    name_hy: 'Ամերիկանո',
  },
  'bar-coffee-bambl': {
    name_en: 'Bumble',
    name_zh: '橙香冰咖啡',
    name_hy: 'Բամբլ',
  },
  'bar-coffee-gliasse': {
    name_en: 'Glacé',
    name_zh: '冰淇淋咖啡',
    name_hy: 'Գլյասե',
  },
  'bar-coffee-kakao-klassicheskii': {
    name_en: 'Classic Cocoa',
    name_zh: '經典可可',
    name_hy: 'Դասական կակաո',
  },
  'bar-coffee-kakao-s-marshmellou': {
    name_en: 'Cocoa with Marshmallow',
    name_zh: '棉花糖可可',
    name_hy: 'Կակաո մարշմելոուով',
  },
  'bar-coffee-kapuchino': {
    name_en: 'Cappuccino',
    name_zh: '卡布奇諾',
    name_hy: 'Կապուչինո',
  },
  'bar-coffee-kapuchino-ais': {
    name_en: 'Iced Cappuccino',
    name_zh: '冰卡布奇諾',
    name_hy: 'Սառը կապուչինո',
  },
  'bar-coffee-kapuchino-s-toppingom': {
    name_en: 'Cappuccino with Topping',
    name_zh: '卡布奇諾配淋醬',
    name_hy: 'Կապուչինո թոփինգով',
  },
  'bar-coffee-latte': {
    name_en: 'Latte',
    name_zh: '拿鐵',
    name_hy: 'Լատտե',
  },
  'bar-coffee-latte-ais': {
    name_en: 'Iced Latte',
    name_zh: '冰拿鐵',
    name_hy: 'Սառը լատտե',
  },
  'bar-coffee-latte-s-toppingom': {
    name_en: 'Latte with Topping',
    name_zh: '拿鐵配淋醬',
    name_hy: 'Լատտե թոփինգով',
  },
  'bar-coffee-matcha-n-shake-latte': {
    name_en: 'Matcha N~Shake (Latte)',
    name_zh: '抹茶拿鐵',
    name_hy: 'Մատչա N~Shake (լատտե)',
  },
  'bar-coffee-raf': {
    name_en: 'Raf Coffee',
    name_zh: '拉夫咖啡',
    name_hy: 'Ռաֆ',
  },
  'bar-coffee-espresso-2': {
    name_en: 'Espresso',
    name_zh: '濃縮咖啡',
    name_hy: 'Էսպրեսսո',
  },
  'bar-coffee-espresso-tonik': {
    name_en: 'Espresso Tonic',
    name_zh: '濃縮咖啡通寧',
    name_hy: 'Էսպրեսսո-տոնիկ',
  },
  'bar-coffee-espresso-dvoinoi': {
    name_en: 'Double Espresso',
    name_zh: '雙份濃縮咖啡',
    name_hy: 'Կրկնակի էսպրեսսո',
  },
  'bar-smoothie-vishnia-klubnika-banan': {
    name_en: 'Cherry, Strawberry, Banana',
    name_zh: '櫻桃、草莓、香蕉',
    name_hy: 'Բալ, ելակ, բանան',
  },
  'bar-smoothie-marakuiia-i-klubnika': {
    name_en: 'Passion Fruit & Strawberry',
    name_zh: '百香果與草莓',
    name_hy: 'Մարակույա և ելակ',
  },
  'bar-milkshake-banan': {
    name_en: 'Banana',
    name_zh: '香蕉',
    name_hy: 'Բանան',
  },
  'bar-milkshake-baunti': {
    name_en: 'Bounty',
    name_zh: 'Bounty 椰子',
    name_hy: 'Բաունտի',
  },
  'bar-milkshake-vanil': {
    name_en: 'Vanilla',
    name_zh: '香草',
    name_hy: 'Վանիլ',
  },
  'bar-milkshake-karamel': {
    name_en: 'Caramel',
    name_zh: '焦糖',
    name_hy: 'Կարամել',
  },
  'bar-milkshake-klubnika': {
    name_en: 'Strawberry',
    name_zh: '草莓',
    name_hy: 'Ելակ',
  },
  'bar-milkshake-oreo': {
    name_en: 'Oreo',
    name_zh: 'Oreo',
    name_hy: 'Օրեո',
  },
  'bar-milkshake-snikers': {
    name_en: 'Snickers',
    name_zh: 'Snickers',
    name_hy: 'Սնիկերս',
  },
  'bar-milkshake-shokolad': {
    name_en: 'Chocolate',
    name_zh: '巧克力',
    name_hy: 'Շոկոլադ',
  },
  'bar-juice-sok-svezhevyzhatyi': {
    name_en: 'Fresh-Squeezed Juice',
    name_zh: '鮮榨果汁',
    name_hy: 'Թարմ քամած հյութ',
  },
  'bar-wine-moet-chandon-brut-imperial': {
    name_en: 'Moët & Chandon Brut Impérial',
    name_zh: 'Moët & Chandon Brut Impérial',
    name_hy: 'Moët & Chandon Brut Impérial',
  },
  'bar-cocktails-martini-bianco-tonic-martini-na-vybor': {
    name_en: 'Martini Bianco & Tonic (martini of your choice)',
    name_zh: 'Martini Bianco & Tonic（馬天尼任選）',
    name_hy: 'Martini Bianco & Tonic (մարտինի ընտրությամբ)',
  },
  'hookah-hookah-banana-boom': {
    composition_en: 'Bowl: pineapple. Flask: vanilla ice cream, banana syrup, fresh banana, cinnamon, fresh mint.',
    composition_zh: '煙鍋：鳳梨。煙瓶：香草冰淇淋、香蕉糖漿、新鮮香蕉、肉桂、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ վանիլային պաղպաղակ, բանանի օշարակ, թարմ բանան, դարչին, թարմ անանուխ։',
  },
  'hookah-hookah-berry-blast': {
    composition_en: 'Bowl: pomegranate. Flask: blackcurrant berries, cranberries, fresh rosemary, raspberry syrup, fresh mint, grape juice.',
    composition_zh: '煙鍋：石榴。煙瓶：黑醋栗、蔓越莓、新鮮迷迭香、覆盆莓糖漿、新鮮薄荷、葡萄汁。',
    composition_hy: 'Գավաթ՝ նուռ։ Կոլբա՝ սև հաղարջ, լոռամիրգ, թարմ խնկունի, ազնվամորու օշարակ, թարմ անանուխ, խաղողի հյութ։',
  },
  'hookah-hookah-black-edition': {
    composition_en: 'Bowl: pomegranate. Flask: blackberries, pineapple juice, lime puree, orange chips, fresh mint.',
    composition_zh: '煙鍋：石榴。煙瓶：黑莓、鳳梨汁、青檸泥、柳橙脆片、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ նուռ։ Կոլբա՝ մոշ, արքայախնձորի հյութ, լայմի խյուս, նարնջի չիպսեր, թարմ անանուխ։',
  },
  'hookah-hookah-dolce-vita': {
    composition_en: 'Bowl: pineapple. Flask: chocolate ice cream, Oreo cookies, cinnamon, fresh mint.',
    composition_zh: '煙鍋：鳳梨。煙瓶：巧克力冰淇淋、Oreo 餅乾、肉桂、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ շոկոլադե պաղպաղակ, Oreo թխվածք, դարչին, թարմ անանուխ։',
  },
  'hookah-hookah-du-barry': {
    composition_en: 'Bowl: pomegranate. Flask: raspberries, strawberry ice cream, Raffaello.',
    composition_zh: '煙鍋：石榴。煙瓶：覆盆莓、草莓冰淇淋、Raffaello。',
    composition_hy: 'Գավաթ՝ նուռ։ Կոլբա՝ ազնվամորի, ելակային պաղպաղակ, Raffaello։',
  },
  'hookah-hookah-old-money': {
    composition_en: 'Bowl: grapefruit. Flask: pineapple juice, peach puree, lime and orange chips.',
    composition_zh: '煙鍋：西柚。煙瓶：鳳梨汁、桃子泥、青檸與柳橙脆片。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ։ Կոլբա՝ արքայախնձորի հյութ, դեղձի խյուս, լայմի և նարնջի չիպսեր։',
  },
  'hookah-hookah-one-more-please': {
    composition_en: 'Bowl: pineapple. Flask: vanilla ice cream, fresh coconut, raspberries, pistachios.',
    composition_zh: '煙鍋：鳳梨。煙瓶：香草冰淇淋、新鮮椰子、覆盆莓、開心果。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ վանիլային պաղպաղակ, թարմ կոկոս, ազնվամորի, պիստակ։',
  },
  'hookah-hookah-paradise': {
    composition_en: 'Bowl: pineapple. Flask: vanilla ice cream, espresso shot, marshmallow, walnut, fresh mint, chocolate bar.',
    composition_zh: '煙鍋：鳳梨。煙瓶：香草冰淇淋、濃縮咖啡、棉花糖、核桃、新鮮薄荷、巧克力。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ վանիլային պաղպաղակ, էսպրեսսոյի շոթ, մարշմելոու, ընկույզ, թարմ անանուխ, շոկոլադե սալիկ։',
  },
  'hookah-hookah-perfume-na-frukte': {
    name_en: 'PERFUME on Fruit',
    name_zh: 'PERFUME 水果煙鍋',
    name_hy: 'PERFUME մրգի վրա',
    composition_en: 'Bowl: grapefruit / pineapple / pomegranate. Tobacco: any of your choice, with Perfume added.',
    composition_zh: '煙鍋：西柚／鳳梨／石榴。煙草：任選，加入 Perfume。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ / արքայախնձոր / նուռ։ Ծխախոտ՝ ըստ ցանկության, perfume-ի ավելացմամբ։',
  },
  'hookah-hookah-perfume-na-chashe': {
    name_en: 'PERFUME on Classic Bowl',
    name_zh: 'PERFUME 經典煙鍋',
    name_hy: 'PERFUME գավաթի վրա',
    composition_en: 'Bowl: classic. Tobacco: any of your choice, with Perfume added.',
    composition_zh: '煙鍋：經典。煙草：任選，加入 Perfume。',
    composition_hy: 'Գավաթ՝ դասական։ Ծխախոտ՝ ըստ ցանկության, perfume-ի ավելացմամբ։',
  },
  'hookah-hookah-tropicana-mama': {
    composition_en: 'Bowl: pineapple. Flask: passion fruit puree, raspberries, kiwi, fresh mint.',
    composition_zh: '煙鍋：鳳梨。煙瓶：百香果泥、覆盆莓、奇異果、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ մարակույայի խյուս, ազնվամորի, կիվի, թարմ անանուխ։',
  },
  'hookah-hookah-vitamin-c': {
    composition_en: 'Bowl: grapefruit. Flask: fresh grapefruit, lemon, lime and mint.',
    composition_zh: '煙鍋：西柚。煙瓶：新鮮西柚、檸檬、青檸與薄荷。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ։ Կոլբա՝ թարմ գրեյպֆրուտ, կիտրոն, լայմ և անանուխ։',
  },
  'hookah-hookah-dolche-vita': {
    name_en: 'Dolce Vita',
    name_zh: '甜蜜生活',
    name_hy: 'Dolce Vita',
    composition_en: 'Bowl: pineapple. Flask: chocolate ice cream, Oreo cookies, cinnamon, fresh mint.',
    composition_zh: '煙鍋：鳳梨。煙瓶：巧克力冰淇淋、Oreo 餅乾、肉桂、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ շոկոլադե պաղպաղակ, Oreo թխվածք, դարչին, թարմ անանուխ։',
  },
  'hookah-hookah-esche-odin-pozhaluista': {
    name_en: 'One More, Please',
    name_zh: '再來一個',
    name_hy: 'Եվս մեկը, խնդրեմ',
    composition_en: 'Bowl: pineapple. Flask: vanilla ice cream, fresh coconut, raspberries, pistachios.',
    composition_zh: '煙鍋：鳳梨。煙瓶：香草冰淇淋、新鮮椰子、覆盆莓、開心果。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ վանիլային պաղպաղակ, թարմ կոկոս, ազնվամորի, պիստակ։',
  },
  'hookah-hookah-kalian-barviha': {
    name_en: 'Barvikha Hookah',
    name_zh: '巴爾維哈水煙',
    name_hy: 'Կալյան Բարվիխա',
    composition_en: 'Bowl: grapefruit / pineapple / pomegranate. Tobacco: any of your choice. Flask: watermelon / melon.',
    composition_zh: '煙鍋：西柚／鳳梨／石榴。煙草：任選。煙瓶：西瓜／哈密瓜。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ / արքայախնձոր / նուռ։ Ծխախոտ՝ ըստ ցանկության։ Կոլբա՝ ձմերուկ / սեխ։',
  },
  'hookah-hookah-kalian-na-frukte': {
    name_en: 'Hookah on Fruit',
    name_zh: '水果煙鍋水煙',
    name_hy: 'Կալյան մրգի վրա',
    composition_en: 'Bowl: grapefruit / pineapple / pomegranate. Tobacco: any of your choice, except Perfume.',
    composition_zh: '煙鍋：西柚／鳳梨／石榴。煙草：任選，Perfume 除外。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ / արքայախնձոր / նուռ։ Ծխախոտ՝ ըստ ցանկության, բացի perfume-ից։',
  },
  'hookah-hookah-kalian-na-chashe': {
    name_en: 'Hookah on Classic Bowl',
    name_zh: '經典煙鍋水煙',
    name_hy: 'Կալյան գավաթի վրա',
    composition_en: 'Bowl: classic. Tobacco: any of your choice, except Perfume.',
    composition_zh: '煙鍋：經典。煙草：任選，Perfume 除外。',
    composition_hy: 'Գավաթ՝ դասական։ Ծխախոտ՝ ըստ ցանկության, բացի perfume-ից։',
  },
  'hookah-hookah-parfium-na-frukte': {
    name_en: 'Parfum on Fruit',
    name_zh: '香水煙水果煙鍋',
    name_hy: 'Պարֆյում մրգի վրա',
    composition_en: 'Bowl: grapefruit / pineapple / pomegranate. Tobacco: any of your choice, with parfum added.',
    composition_zh: '煙鍋：西柚／鳳梨／石榴。煙草：任選，加入香水煙。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ / արքայախնձոր / նուռ։ Ծխախոտ՝ ըստ ցանկության, պարֆյումի ավելացմամբ։',
  },
  'hookah-hookah-parfium-na-chashe': {
    name_en: 'Parfum on Classic Bowl',
    name_zh: '香水煙經典煙鍋',
    name_hy: 'Պարֆյում գավաթի վրա',
    composition_en: 'Bowl: classic. Tobacco: any of your choice, with parfum added.',
    composition_zh: '煙鍋：經典。煙草：任選，加入香水煙。',
    composition_hy: 'Գավաթ՝ դասական։ Ծխախոտ՝ ըստ ցանկության, պարֆյումի ավելացմամբ։',
  },
  'hookah-hookah-sigarnaia-lineika-na-frukte': {
    name_en: 'Cigar Line on Fruit',
    name_zh: '雪茄系列水果煙鍋',
    name_hy: 'Սիգարի շարք մրգի վրա',
    composition_en: 'Bowl: any fruit of your choice. Tobacco: any tobacco with the cigar line added, except Perfume.',
    composition_zh: '煙鍋：任選水果。煙草：任選並加入雪茄系列，Perfume 除外。',
    composition_hy: 'Գավաթ՝ ցանկացած միրգ ըստ ցանկության։ Ծխախոտ՝ ցանկացած ծխախոտ սիգարի շարքի ավելացմամբ, բացի perfume-ից։',
  },
  'hookah-hookah-sigarnaia-lineika-na-chashe': {
    name_en: 'Cigar Line on Classic Bowl',
    name_zh: '雪茄系列經典煙鍋',
    name_hy: 'Սիգարի շարք գավաթի վրա',
    composition_en: 'Bowl: classic. Tobacco: any tobacco with the cigar line added, except Perfume.',
    composition_zh: '煙鍋：經典。煙草：任選並加入雪茄系列，Perfume 除外。',
    composition_hy: 'Գավաթ՝ դասական։ Ծխախոտ՝ ցանկացած ծխախոտ սիգարի շարքի ավելացմամբ, բացի perfume-ից։',
  },
  'hookah-hookah-tropikana-mama': {
    name_en: 'Tropicana Mama',
    name_zh: '熱帶媽媽',
    name_hy: 'Tropicana Mama',
    composition_en: 'Bowl: pineapple. Flask: passion fruit puree, raspberries, kiwi, fresh mint.',
    composition_zh: '煙鍋：鳳梨。煙瓶：百香果泥、覆盆莓、奇異果、新鮮薄荷。',
    composition_hy: 'Գավաթ՝ արքայախնձոր։ Կոլբա՝ մարակույայի խյուս, ազնվամորի, կիվի, թարմ անանուխ։',
  },
  'hookah-hookah-firmennyi-kalian': {
    name_en: 'Signature Hookah',
    name_zh: '招牌水煙',
    name_hy: 'Ֆիրմային կալյան',
    composition_en: 'Bowl: grapefruit / pineapple / pomegranate. Tobacco: any of your choice. Flask: watermelon / melon / pumpkin.',
    composition_zh: '煙鍋：西柚／鳳梨／石榴。煙草：任選。煙瓶：西瓜／哈密瓜／南瓜。',
    composition_hy: 'Գավաթ՝ գրեյպֆրուտ / արքայախնձոր / նուռ։ Ծխախոտ՝ ըստ ցանկության։ Կոլբա՝ ձմերուկ / սեխ / դդում։',
  },
};
