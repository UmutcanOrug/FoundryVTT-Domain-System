# DS: Domain System Kullanim Kilavuzu

DS, Foundry VTT v13 build 351 icin Astargon yerleskelerini uzun vadeli bir Total War dongusuyle yonetir. Varsayilan acilis tusu `K`'dir.

## Erisim ve Ekranlar

- Oyuncu yalnizca kendisine atanmis yerleskeleri gorur.
- GM profil, bina durdurma, insaat, recruitment, Treasury transferi ve tur notu izinlerini yerleske bazinda verir.
- `Overview`: 4x2 district tahtasi, branch secici, kuyruklar, Landmark, Raised Forces ve gercek Settlement Garrison ozeti.
- `Town`: kademe, profil, policy, Treasury, POP, Growth ve tamamlanmis binalar.
- `Construction`: proje kuyrugu ve tum ekonomik/askeri bina agaclari.
- `Recruitment`: askeri bina agaclari, acilmis unitler, ortak recruitment havuzu, replenishment ve regimentler.
- `Chronicle`: Treasury transferleri, ay sonuclari, oyuncu notlari ve GM kayitlari.
- `Rules`: tum temel formuller, Food/Public Order bantlari ve GM dunya ayarlari.
- `Content Library`: GM icin bina/unit agaclari, Unique/Landmark bolumleri, d100 Event sablonlari, kategori ve policy yonetimi ile aktarim araclari.
- `GM Controls`: ay yonetimi, ledger, rank, gorseller, landmark, dogrudan yerlestirme, yerleske buff/debufflari, olay ve geri alma.

## Yerleske Hiyerarsisi

Normal bina Tier 1-5, yerleske kademesiyle eslesir. Landmark tier kullanmaz ve normal district harcamaz.

| Kademe | Minimum POP | Acik / Azami Slot | Free POP Geliri | Terfi Crown | Materials | CP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Hamlet | 0 | 2 / 3 | 10 | - | - | - |
| Village | 100 | 3 / 4 | 20 | 20.000 | 500 | 3.000 |
| Town | 500 | 4 / 6 | 30 | 80.000 | 2.500 | 12.000 |
| City | 2.000 | 6 / 8 | 40 | 300.000 | 10.000 | 40.000 |
| Metropolis | 8.000 | 8 / 10 | 50 | 1.000.000 | 35.000 | 120.000 |

Food bir terfi veya insaat para birimi degildir. Terfi Crown ve Materials pesin odendikten sonra CP ile tamamlanir. GM `Settlement Rank` ile masrafsiz dogrudan kademe degistirebilir.

GM, Rules ekraninda bu slot ve terfi degerlerini degistirebilir. Schema v12 gecisi custom slot degerlerini ve varsayilandan farkli custom terfi fiyatlarini korur.

## Otomatik Is Gucu

Manuel `Assigned POP` yoktur.

```text
Operating Building = gerekli POP'un tamami otomatik ayrilir
Waiting Building = yeterli Free POP yok, output yok, yarim upkeep
Halted Building = POP ayirmaz, output yok, yarim upkeep
Free POP = Total POP - calisan binalarin gerekli POP toplami
```

- Sistem binalari listedeki sirayla doldurur.
- Bir bina ya yuzde 100 calisir ya hic calismaz; kismi iscilik yoktur.
- Oyuncu izinliyse `Halt` ve `Continue` dugmelerini kullanabilir.
- Halt edilen bina districti terk etmez ve branch ilerlemesini kaybetmez.
- Yapinin verdigi bonus slotlar genel district slotudur; Economic/Military ayrimi yoktur ve bina halt edilince kaybolmaz.
- Her bina karti `Requires X POP` bilgisini gosterir.
- Free POP, kademe gelirini, subsistence Food'u ve Construction CP'yi uretir.

## Crown ve Building Upkeep

```text
Base Crown = Free POP x kademe geliri
Building Crown = calisan binalarin worker geliri + flat geliri
Gross Crown = (Base + Building) x dunya/policy/event x Public Order bandi
Net Crown = Gross Crown - Building Upkeep - Army Upkeep
```

- Calisan bina tam upkeep oder.
- Halt veya Waiting bina yarim upkeep oder.
- Commerce inland dali, tum yerleskenin Building Upkeep'ini yuzdesel azaltir.
- Army upkeep indirimi ayri hesaplanir ve Building Upkeep'e uygulanmaz.
- Ay sonunda Net Crown otomatik Treasure'a eklenir.

v0.1.15 Crown fiyatlari yavas ilerleyen kampanya aylari icin yeniden olceklendi. Materials, CP, workforce, output ve upkeep ayni kaldi. Ornek T3 fiyatlari: Merchants Guild `35.000`, Drill Hall `35.000`, Stable Compound `40.000`, Festival Hall `75.000` ve Stone Walls `20.000` Crown. Merchants Guild + Grain Estate + Masonry District + Festival Hall + Drill Hall + Stone Walls son node toplami `285.000` Crown'dur.

Oyuncu izinliyse Town icindeki `Treasury` panelinden Crown yatirabilir veya cekebilir. Her transfer Chronicle'a oyuncu adi, miktar ve kalan Treasury ile kaydedilir. Modul sistem bagimsiz oldugu icin karakter sheetindeki para otomatik degismez; oyuncu kendi sheet kaydini kampanya usulune gore duzeltir.

## Food Akisi ve Food Security

Food kalici bir depo degildir. Her ay sadece o ayin uretimi ve tuketimi karsilastirilir.

```text
Subsistence Food = Free POP x 0,25
Food Production = Subsistence + calisan Food binalari
Food Consumption = Total POP x Food/POP + Army Food + Policy/Building tuketimi
Food Coverage = Production / Consumption
```

| Coverage | Durum | Growth | d100 |
| --- | --- | ---: | ---: |
| 0-49% | Starvation | -3% | -5 |
| 50-74% | Severe Shortage | -2% | -3 |
| 75-99% | Shortage | -1% | -1 |
| 100-124% | Sustained | 0% | 0 |
| 125-149% | Well Fed | +0,5% | +1 |
| 150-199% | Plentiful | +1% | +2 |
| 200%+ | Abundant | +1,5% | +3 |

Bir onceki aydan Food biriktirmek acigi gizlemez. Uygun tierdeki tek Food binasi, ordusu olmayan yerleskeyi bir sonraki nufus esigine kadar besleyebilir. Saf dal ordu ve krizler icin daha buyuk rezerv saglar; Hybrid Pastoral dali sivil ihtiyaci karsilarken Food rezervinin bir kismini Crown, Growth ve recruitment indirimine cevirir. Ikinci Food yatirimi normal sivil ekonomi icin zorunlu degil, buyuk ordu veya cok yuksek surplus icin stratejik tercihtir.

## Ekonomik Bina Aileleri

### Food, yesil

- `Land Clearance -> Farmstead`
- Saf dal: `Grain Estate -> Grand Granary -> Agrarian Heartland`
- Hybrid dal: `Pastoral Ranch -> Royal Stockyards -> Royal Pastures`
- Saf dal en yuksek Food'u verir.
- Hybrid dal Food + Crown + Growth + recruitment indirimi verir.
- Horse resource yoktur; cavalry icin Stable zinciri yeterlidir.

### Materials, gumus

- `Survey Camp`
- Saf dal: `Stone Quarry -> Masonry District -> Builders Guild -> Monumental Works`
- Hybrid dal: `Iron Mine -> Ironworks -> Grand Foundry -> Industrial Complex`
- Saf Stone dali en yuksek Materials'i verir. Tier 2-5 boyunca insaat Crown ve Materials maliyetini `%5/%10/%15/%20` azaltir ve ayni oranda Construction CP bonusu verir.
- Hybrid Iron dali Materials + Crown verir ve Tier 2-5 boyunca Army Upkeep'i `%5/%10/%15/%20` azaltir.
- Iron resource veya Iron tag gereksinimi yoktur.

### Commerce, sari

- `Trading Post` koktur.
- Inland market dali duzenli Crown verir. Grand Bazaar Building/Army Upkeep'i `%5`, World Market `%10` azaltir.
- River/Harbor dali Crown ve daha iyi event roll yaninda, ana Food veya Materials binalarinin yerini tutmayacak miktarda iki kaynagi da destekler.
- Bir dal her durumda dogrudan digerinden iyi degildir.

### Civic, turkuaz

- Crown veya Food basmaz.
- Culture dali daha fazla Public Order ve event kontrolu verir; Cultural Capital ayrica toplam settlement Crown uretimini `%25` arttirir.
- University dali Public Order vermez. Sacred University `+%3 Growth` ve `-%20 Building Upkeep` verir.
- Buyuyen yerleskede Population Order Pressure'i dengelemek icin Civic yatirimi gerekir.

## Construction ve Branch Secimi

```text
Monthly CP = Free POP x CP/Free POP + calisan bina CP bonuslari
```

- Insaata Crown ve Materials pesin odenir.
- Sabit ay suresi yoktur; proje gereken CP tamamlanana kadar ilerler.
- Birden fazla aktif proje CP'yi agirliklarina gore paylasir.
- Ay sonu overflow aciksa artan CP sonraki projeye akar.
- Overview districtine tiklamak branch seciciyi acar.
- Bilgi paneli description, gerekli POP, output, upkeep, recruit, garrison, maliyet ve gereksinimleri gosterir.
- Bir bina yalnizca mevcut node'un dogrudan child node'una gelisir.
- Ust tier military bina, kendi branchindeki onceki unit unlocklarini kaybetmez.
- GM, `GM Construction Queue` ile normal bina veya Landmark'i CP suresiyle kuyruga ekleyebilir.
- GM isterse normal Crown/Materials maliyetini uygular, isterse checkbox'i kapatir.
- Landmark construction normal district ayirmaz ve mevcut Laurent Manor'i degistirmez.

## Manpower ve Recruitment

Bir POP yaklasik 10 kisiyi temsil eder. Bir POP ayni zamanda lorduna 1 Manpower Cap verir; asker sivil POP'u eksiltmez.

```text
Manpower Cap = floor(Total POP x Manpower Rate) + Bonus
Committed Force = raised/manual asker + kuyruktaki asker/replenishment
Force Capacity = Manpower Cap - Committed Force
Recruitable Now = min(Manpower Reserve, Force Capacity)
```

- Varsayilan Manpower Rate %100'dur.
- Manpower Reserve her islenen ay cap'in %10'u kadar yenilenir, fakat mevcut/kuyruktaki ordudan kalan Force Capacity'yi asmaz.
- Recruitment emri Crown ve Manpower'i verildigi anda ayirir.
- Iptal edilen emrin egitilmemis kismi Crown ve Manpower iadesi alir.
- Savas kayiplari otomatik manpower iadesi vermez.
- Binalarin ucretsiz verdigi Settlement Garrison kalici Manpower Cap kullanmaz; GM'in elle ekledigi normal garrison regimentleri kullanir.

### Ortak Recruitment Capacity

Recruitment binasi belirli bir unit uretim noktasi degil, aylik egitim havuzuna kapasite veren bir tech node'dur.

| Bina seviyesi | Ornek kapasite |
| --- | ---: |
| Muster Field | 10 |
| Infantry Yard / Archery Range | 15 |
| Drill Hall / Stable / Marksmen Range | 25 |
| Royal Barracks / Cavalry Yard / Rangers Lodge | 40 |
| Tier 5 recruitment sonlari | 70 |
| Laurent Manor varsayilani | 10 |

Ornek: `Infantry Yard 15 + Laurent Manor 10 = 25 Recruitment Capacity`. Oyuncu acilmis roster icinden toplam 25 asker secebilir. Kaynak bina dropdownu yoktur. Daha yuksek bina, branch atalarinin unitlerini de acik tutar.

Stable kendi basina mounted unit dalini acar. Horses gerekmez. Siege Workshop, Royal Arsenal ve Grand Arsenal sirasiyla 15, 25 ve 40 capacity verirken siege unitlerini acar.

## Unit Upkeep ve Replenishment

Garrison/Campaign upkeep ayrimi yoktur.

```text
Monthly Unit Upkeep = Recruit Cost x %20
Replenishment Cost = Recruit Cost x %35
```

GM bu iki yuzdeyi Rules ekranindan degistirebilir.

- Regiment `Current / Maximum` strength tutar.
- GM veya izinli oyuncu savas kaybini Current Strength'i azaltarak girer.
- Replenishment eksik asker kadar Crown ve Manpower ayirir.
- Replenishment bina istemez.
- Replenishment Recruitment Capacity harcamaz.
- Replenishment ay sonunda tamamen uygulanir.
- Ayni regiment icin ayni anda tek aktif replenishment emri olabilir.
- Regiment resmi, adi, notu ve Foundry Actor UUID'si unit sablonundan bagimsizdir.

## Defense, Settlement Garrison ve Siege Defense

Eski belirsiz Defense target/coverage sistemi yoktur. Defense binalari somut regiment kayitlari ve yuzdesel Siege Defense verir.

| Bina | Ucretsiz Settlement Garrison | Order | Siege Defense |
| --- | --- | ---: | ---: |
| Watch Post | 20 Militia | +2 | +5% |
| Palisade | 30 Militia, 15 Town Guard | +4 | +10% |
| Stone Walls | 25 Spearmen, 15 Men-at-Arms, 20 Archers | +7 | +20% |
| Citadel | 25 Veteran Infantry, 20 Crossbowmen, 25 Men-at-Arms | +12 | +35% |
| Grand Fortress | 210 Town Guard, 45 Men-at-Arms, 30 Archers, 15 Royal Guard | +20 | +50% |

- Bina kaynakli ucretsiz garrison kalici Manpower Cap veya Recruitment Capacity kullanmaz ve Crown upkeep odemez.
- Calisan kaynak bina varsa garrison Food tuketir, Defense Power'a katilir ve ay sonunda replenishment olabilir.
- Kaynak bina Halt/Waiting durumundaysa garrison gecici olarak pasif olur; Food tuketmez ve Defense Power vermez.
- Garrison regimentlerinin Current/Maximum Strength kaydi vardir. Kayiplar Recruitment sayfasinin en altindaki `Garrison Regiments` bolumunden girilir ve bina hesaplaninca silinmez.
- Garrison replenishment eksik asker icin Crown ve Manpower Reserve ayirir, bina veya Recruitment Capacity istemez ve ay sonunda tamamlanir.
- Bina upgrade edilirse mevcut kayiplar korunur; yalnizca yeni seviyenin ekledigi askerler maksimum ve mevcut guce eklenir.
- GM'in Add Regiment wizardiyla ekledigi manuel garrison normal upkeep, Food ve Manpower kurallarini kullanir.
- Stone Walls +1, Grand Fortress +2 genel district slotu verir.
- Overview, Raised Forces ve Settlement Garrison regimentlerini ayri gosterir.
- Toplam Siege Defense %75'te sinirlanir.
- `Uses Defense` isaretli zararli ay sonu event modifierlari Siege Defense yuzdesi kadar azalir. Mevcut surumde kusatma savasi veya casualty cozumlemez.

## Public Order

Effective Order; Base Public Order, bina/policy/event bonuslari ve Population Order Pressure ile hesaplanir. Oyuncu Town ekranindaki `Public Order Breakdown` panelinde tum parcalari gorebilir. GM kalici baslangic degerini `GM Controls -> Settlement Ledger -> Base Public Order` alanindan degistirir.

| Order | Durum | Crown | Growth | d100 |
| --- | --- | ---: | ---: | ---: |
| 0-24 | Unrest | -50% | -1% | -5 |
| 25-49 | Unstable | -25% | -0,5% | -2 |
| 50-74 | Stable | 0% | 0% | 0 |
| 75-89 | Content | +10% | +0,25% | +2 |
| 90-100 | Prosperous | +20% | +0,5% | +4 |

Varsayilan Population Order Pressure:

```text
100 POP'a kadar 0
Her iki kat nufusta -3 Order
En fazla -25 Order
```

Growth icin ayri Population Pressure varsayilani her iki kat nufusta -0,25%, en fazla -3%'tur. Bu iki baski sayesinde buyuk yerleske daha fazla Food ve Civic yatirimi ister.

## Policies

Her yerleskede ayni anda bir policy aktiftir.

- `Balanced Administration`: modifier yok.
- `Heroic Land Grants`: her ay duz +20 POP; -40% Crown, POP basina +0,5 Food, +25% Building Upkeep ve -8 Order. Bonus sabit kaldigi icin erken oyunda guclu, buyuk yerleskede verimsizdir.
- `Expanded Rations`: POP basina +1 Food tuketimi, +0,75% Growth, +3 Order.
- `Heavy Taxation`: +25% Crown, -0,5% Growth, -5 Order.
- `War Taxes`: +10% Crown, -25% army upkeep, -0,75% Growth, -4 Order.
- `Muster Reserves`: +25% Manpower Cap, +15% Army Food, -0,25% Growth.
- `Public Festivals`: -10% Crown, +0,25% Growth, +10 Order, +2 event roll.

GM, Content Library icindeki `Policies` yoneticisinden yerleske kademesi, aciklama ve tum mekanik modifierlari olan yeni policy ekleyebilir. Built-in policy'ler duzenlenip varsayilana dondurulebilir. Custom policy silinirse onu kullanan yerleskeler Balanced Administration'a doner.

## d100 Ay Sonu Olaylari

- Eventler otomatik flat Crown, Food, Materials veya POP vermez.
- Food Security ve Public Order kendi kesin d100 modifierlarini ekler.
- Bina event bonuslari ve aktif modifierlar da hesaba katilir.
- GM sonucu `Apply Modifier`, `Narrative Only`, `Reroll` veya `Ignore` ile karara baglar.
- Uygulanan mekanik etkiler sureli yuzdelerdir.
- GM olay degerlerini kabul etmeden once degistirebilir.
- Ay kapatmak icin bekleyen event kararlarinin bitmesi gerekir.

## Content Workshop, Kategoriler ve Aktarim

Content Library, tek alanli hizli ekleme yerine ayri bir wizard acar:

- `Create Building Chain`: kategori ve branch kimligini secip T1-T5 veya tierless Landmark nodelarini parent baglantilariyla birlikte kurar.
- `Create Unit Tree`: normal veya Unique unitleri tier, aile, parent, recruitment kaynagi, Power, Food, Crown, upkeep, Actor ve gorselleriyle birlikte kurar.
- `Add Regiment`: GM'in mevcut unit katalogundan secim yapip Raised veya Garrison olarak Current/Maximum Strength ile yerlestirmesini saglar.

`Categories` ekraninda built-in ailelerin adi, rengi, ikonu ve sirasi degistirilebilir. GM yeni Economic veya Military kategori ekleyebilir; kullanilmayan custom kategori silinebilir. Kategori tipi degisirse bagli katalog ve yerleske bina kayitlari birlikte tasinir.

Aktarim dugmeleri:

- `Export Content`: bina, unit, event, kategori ve policy verisini baska dunyaya tasinabilir JSON olarak indirir.
- `Backup World`: tum settlementlar, kuyruklar, regimentler, loglar ve dunya ayarlariyla tam geri yukleme dosyasi indirir.
- `Import JSON`: Content paketini mevcut settlementlara dokunmadan Merge/Replace eder; World Backup ise acik onaydan sonra tam dunya geri yuklemesi yapar.

Patch guncellemeleri Foundry world ayarlarindaki runtime veriyi silmez. Yine de buyuk guncelleme veya custom katalog degisikliginden once `Backup World` kullanilmasi tavsiye edilir.

## GM Yerleske Etkileri

GM Controls icindeki `Settlement Buffs and Debuffs` bolumu, secili yerleskeye sureli veya kalici mekanik etki ekler. Crown, Food, Materials, Growth, Order, Building/Army Upkeep, Construction CP ve Recruitment Cost alanlari ayarlanabilir. Etki oyuncuya acik veya yalnizca GM gorunur olabilir; kalan ay sayisi her islenen ay azalir.

## GM Landmark ve Content Library Akisi

GM Controls icinde:

- `Direct Building Placement`: normal binayi aninda bos districte koyar.
- `Place Landmark Immediately`: landmarki slota ve masrafa gerek olmadan koyar.
- `GM Construction Queue`: normal bina veya landmarki CP projesi olarak kuyruga koyar.
- Building editoru gerekli POP, Crown/Materials/CP cost, output, upkeep, discount, recruitment, Siege Defense ve `unit-id:count` garrison listesini duzenler.
- Unit editoru recruit cost, tek upkeep yuzdesi, Power, Food, limit, Actor ve resmi duzenler.
- Royal Guard, Imperial Guard, Imperial Marksmen, Knights, War College Champions ve Grand Artillery Train normal askeri agaclarin ust tier birlikleridir; Unique degildir.
- Unitler Infantry, Ranged, Cavalry ve Siege ailelerinde T1-T5 agaci olarak okunur. Yalnizca Landmark'a baglanan gercek `Unique Unit` birlikleri ayri bolumde gorunur.
- Built-in gercek Unique ornekleri Tier 4 Gladiators ve hybrid melee/ranged Elven Guard'dir.
- Unit editorundeki `Recruitment Buildings` listesi normal birimleri askeri binalara, Unique birimleri Landmark'lara baglar. Unique atanan Landmark recruitment acik degilse sistem bunu acar ve asgari capacity saglar.

## De Laurent Korunmasi

De Laurent bir oyuncu yerleskesidir ve reusable template degildir. `Restore Sample` mevcut De Laurent kaydini ezmez.

Laurent Manor:

- Tierless Landmark'tir.
- Normal district harcamaz.
- Varsayilan 5 POP ister.
- Varsayilan +10 Recruitment Capacity verir.
- Varsayilan +2 genel district slotu verir.
- Varsayilan 20 Town Guard + 10 Men-at-Arms ucretsiz Settlement Garrison verir.
- Varsayilan +10% Siege Defense ve +6 Public Order verir.
- Custom workers, upkeep, recruitment, resim ve not degerleri schema v12 gecisinde korunur.

## Schema v12 Gecisi

v0.1.15 ve daha eski dunya verileri otomatik tasinir.

- Terrain ve Biome alanlari profil, sablon, bina editoru ve kurulum kosullarindan kaldirilir.
- Iron/Horse resource ve unit gereksinimleri kaldirilir.
- Stored Food ve construction Food cost kayitlari sifirlanir.
- Built-in Food zinciri v0.1.14 sivil nufus hedeflerini korur; mevcut Food binalari da guncel outputu alir.
- Eski Economic/Military bina bonus slotlari tek genel `Bonus District Slots` alaninda birlestirilir.
- Stone, Iron, Commerce, Civic ve Defense bonuslari v0.1.14 kimliklerine yenilenir; indirimler gercek kuyruk maliyetine ve aylik hesaplara uygulanir.
- Built-in ust tier birlikler normal Infantry, Ranged, Cavalry ve Siege agaclarina tasinir. Gladiators ve Elven Guard Landmark-only Unique olarak eklenir.
- Arena/Gladiator veya Elf adli custom Landmark'lar uygun Unique birimle otomatik eslestirilir.
- Built-in bina Crown fiyatlari yeni 2-6 aylik yatirim egilimine yenilenir; mevcut aktif projelerin daha once odenmis bedeli degismez.
- Eski varsayilan terfi fiyatlari bese bolunur. GM'in varsayilandan farkli custom terfi fiyatlari korunur.
- Heroic Land Grants ve oyuncuya acik Public Order dokumu eklenir.
- Manuel assignment yerine otomatik is gucu uygulanir.
- Eski Garrison/Campaign upkeep tek %20 upkeep'e tasinir.
- Settlement kimligi, owner, custom catalog, resim, regiment, Actor, log ve notlar korunur.
- Custom slot kurallari korunur.
- Laurent Manor'un custom workers, upkeep, recruitment, resim ve notlari korunur.
- Eski regimentler davranis degisikligiyle beklenmedik garnizona donusmemesi icin Raised olarak korunur.
- Bina `garrisonUnits` listeleri, kayip alabilen gercek Settlement Garrison regimentlerine donusturulur.
- Custom content kategorileri, policy'ler ve yerleske buff/debuff kayitlari yeni dunya verisine eklenir.

## City Denge Referansi

Otomatik testte 5.000 POP City, tek Food districtiyle su sekiz districti ve Laurent Manor'i kullanir:

```text
Grand Granary
Grand Bazaar
Grand Harbor
Builders Guild
Grand Foundry
Cathedral Academy
Royal Barracks
Citadel
Laurent Manor (district disi)
```

Sonuc:

```text
Gross Crown: 249.150
Building Upkeep: 15.390
Surdurulebilir Men-at-Arms: yaklasik 2.365
Bu ordudaki Food Coverage: %145
```

Bu zorunlu build degil, denge regression referansidir. Oyuncu daha fazla Order, Growth, Materials, recruitment veya savunma icin income ve army kapasitesinden fedakarlik yapabilir.

## Release Adresleri

Repository:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System
```

Latest manifest:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/module.json
```

Latest package:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.16.zip
```
