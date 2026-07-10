# DS: Domain System Kullanim Kilavuzu

DS, Foundry VTT v13 build 351 icin Astargon yerlesimlerini Total War benzeri bir uzun vadeli yatirim dongusuyle yonetir.

## Acilis ve Erisim

- Varsayilan kisayol `K` tusudur.
- Foundry Keybindings menusunden degistirilebilir.
- Oyuncu yalnizca kendisine atanmis settlementlari gorur.
- Oyuncu izinleri her settlement icin GM Controls bolumunden ayarlanir.

## Yerlesim Hiyerarsisi

Varsayilan ilerleme:

| Kademe | Minimum POP | Acik / Azami Slot | Promotion Crown | Promotion CP |
| --- | ---: | ---: | ---: | ---: |
| Hamlet | 0 | 2 / 3 | 0 | 0 |
| Village | 100 | 4 / 6 | 4.000 | 700 |
| Town | 500 | 7 / 9 | 15.000 | 2.200 |
| City | 2.000 | 10 / 12 | 50.000 | 7.000 |
| Metropolis | 8.000 | 14 / 16 | 150.000 | 20.000 |

POP esigine ulasmak settlementi otomatik yukseltmez. Town ekraninda yeni ana bina projesi acilir. Crown odendikten sonra gereken CP dolunca settlement bir ust kademeye gecer ve yeni slotlari acilir.

Butun esikler, slot sayilari, promotion maliyetleri, CP ve ayni anda ilerleyebilen proje sayisi Rules ekranindan GM tarafindan degistirilebilir.

## District Slotlari

Her bina gercek bir district slotunda bulunur.

- `Unlocked`: bina kurulabilir.
- `Purchasable`: oyuncu belirtilen Crown bedelini odeyerek acabilir.
- `GM Locked`: yalnizca GM tarafindan serbest birakilabilir.
- `Economic`, `Military` veya `Any Building`: slotun kabul ettigi bina turudur.

GM her slotun adini, bedelini, kategorisini ve kilit durumunu Construction ekranindaki Slot ayarlarindan degistirebilir. Mevcut veya kuyruktaki binalar migration sirasinda otomatik olarak slotlara yerlestirilir.

## Bina Agaclari

Binalar artik ayni kartin Level degerini carpmaz. Her asama ayri bir bina dugumudur ve kendi ismine, resmine, maliyetine, CP degerine, outputuna ve unlocklarina sahiptir.

Ornek Barracks agaci:

```text
Barracks
|- Infantry Yard -> Drill Hall -> Royal Barracks
|- Archery Range -> Marksmen Range -> Rangers Lodge
`- Stable -> Cavalry Yard -> Knightly Stables
```

Bir slotta Barracks sonrasi secilen dal o slotun yoludur. Baska bir dal icin farkli bir slotta yeni Barracks kurulabilir.

Built-in ekonomik aileler Timber, Leather, Stone, Iron, Grain, Livestock, Harbor, Orchard, Medicine, Trade ve Logistics agaclarini kapsar. Askeri aileler Barracks, Watch, Defense ve Siege agaclarini kapsar.

`Special` ayri bir kategori degildir. Her bina Economic veya Military olur; benzersiz binalar ayrica Special yildizi tasiyabilir.

## Construction ve CP

Bir proje kuyruga alinmadan once su kontroller yapilir:

- Secilen slot acik ve uygun kategoride mi?
- Bos slotta bina agacinin kok dugumu mu secildi?
- Dolu slotta secilen dugum mevcut binanin dogrudan dali mi?
- Settlement kademesi, terrain, biome ve prerequisite kosullari uygun mu?
- Slotta baska bir proje var mi?
- Treasure Crown maliyetini karsiliyor mu?

Temel formuller:

```text
Base Construction CP = Free POP x CP per Free POP + Building Construction Bonuses
Estimated Months = Remaining CP / Expected Assigned CP
```

- Binanin sabit ay suresi yoktur.
- Crown, proje kuyruga girerken Treasure'dan dusulur.
- Free POP her islenen ayda temel CP uretir.
- Settlement kademesi birden fazla aktif proje acarsa temel CP aktif projeler arasinda paylasilir.
- Tamamlanan projeden kalan CP, Rules ayari aciksa siradaki projeye aktarilir.
- Hired CP tek kullanimliktir, belirtilen GP/CP bedeliyle alinir ve sonraki islemde tuketilir.
- Iptal edilen proje odedigi bina Crown maliyetini geri alir; kullanilmis veya satin alinmis is gucu geri verilmez.

## Ekonomi

Varsayilan temel gelir:

```text
Base Income = Free POP x 5 Crown
Gross Income = (Base Income + Economic Building Output) x Income Multiplier
Net Income = Gross Income - Building Upkeep - Army Upkeep
Treasure Change = Net Income
```

Oyuncu POP'u ekonomik binalara atayarak bina outputu kazanir; Free POP azalinca vergi ve temel CP de azalir. Bu nedenle her POP atamasi ekonomi ile insaat hizi arasinda bir karardir.

Ekonomik dugumler yalnizca para vermek zorunda degildir. Growth, construction bonus, recruitment discount veya upkeep discount saglayabilir. Recruitment indirimi varsayilan olarak yuzde 50, upkeep indirimi yuzde 60 tavanina sahiptir.

## Recruitment

Her building node icinde `Can Recruit Units` isareti, aylik kapasite ve basabildigi unit listesi bulunur.

- Barracks profesyonel askeri agaclarin ortak baslangicidir.
- Infantry, archery ve stable dallari farkli unitleri acar.
- Watch binalari guard ve militia odaklidir.
- Siege binalari Siege Crew acabilir.
- GM Content Library ile herhangi bir Economic veya Military binaya ozel recruitment yetkisi verebilir.

Recruit emri acilirken bina unlocku, bina kapasitesi, manpower, professional veya militia capacity ve Treasure kontrol edilir.

```text
Recruit Cost = Effective Unit Cost x Count
Monthly Training = Source Building Recruit Capacity
```

Varsayilan yeni regiment upkeep oranlari:

- Professional Garrison: recruit bedelinin yuzde 3'u
- Professional Campaign: recruit bedelinin yuzde 8'i
- Militia Garrison: recruit bedelinin yuzde 1'i
- Militia Campaign: recruit bedelinin yuzde 4'u

Bu oranlar Rules ekranindan degistirilir. Unit template isterse sabit upkeep degerleri kullanabilir.

Her recruitment emri ayri bir regiment olusturur. Ayni turden iki emir otomatik birlesmez. Atanmis oyuncu regiment adini, resmini, notunu ve Garrison veya Campaign durumunu degistirebilir. Bu degisiklik global unit template resmini etkilemez.

Direct GM secenegi yalnizca GM'e gorunur ve bina, capacity, manpower ve Crown kosullarini atlar.

## Ay ve Tur Islemleri

GM Controls icinde uc ayri kontrol bulunur:

- `World Month`: ustte gorunen ay numarasini degistirir; tek basina gelir uretmez.
- `Process Selected Settlement`: yalnizca secili settlementi mevcut ay icin isler ve dunya ayini artirmaz.
- `Close Global Month`: yalnizca o ay henuz islenmemis settlementlari isler ve dunya ayini bir artirir.

Her settlement `lastProcessedMonth` tutar. Normal bireysel islem ayni ayda ikinci kez calisamaz. GM gerekirse Force butonuyla bilerek yeniden isleyebilir.

Settlement tur sirasi:

1. Mevcut gelir, bina upkeep ve ordu upkeep hesaplanir.
2. Free POP tabanli CP aktif projelere uygulanir.
3. Tamamlanan bina veya settlement progression projeleri sonuclanir.
4. Net Income Treasure'a eklenir.
5. Recruitment kuyruklari kaynak bina kapasitesine gore ilerler.
6. Population growth uygulanir.
7. Player ve GM notlari Event Log'a yazilir.

## Rules Ekrani

Rules butun oyuncular tarafindan okunabilir, yalnizca GM tarafindan degistirilebilir.

- Settlement tier adlari ve POP esikleri
- Acik ve azami slot sayilari
- Promotion Crown ve CP maliyetleri
- Slot satin alma bedelleri
- Aktif construction proje sayisi
- Free POP vergi ve CP katsayilari
- Income multiplier ve Hired CP bedeli
- Professional ve Militia upkeep yuzdeleri

## Content Library - GM

Building node alanlari:

- Isim, kategori, Special ve GM Only isaretleri
- Chain ID, Node Tier ve Parent Node IDs
- Gerekli settlement tieri, terrain ve prerequisite
- Crown, CP, worker capacity, GP/worker, flat output ve building upkeep
- Construction bonus, growth, recruitment ve upkeep indirimleri
- Professional ve Militia capacity
- Can Recruit Units, aylik recruit capacity ve unit unlock listesi
- Bina resmi ve notlari

Unit template alanlari:

- Isim, rol, tier ve resim
- Recruit cost
- Garrison ve Campaign upkeep
- Aciklama ve etkinlik durumu

## De Laurent ve Settlement Sablonlari

De Laurent normal bir oyuncu settlementidir. Restore veya template islemi De Laurent kaydinin uzerine yazmaz.

Yeni settlementlar ayri `Starter Village` sablonundan uretilir. GM olusturduktan sonra isim, gorsel, oyuncu atamasi, biome ve baslangic degerlerini duzenleyebilir.

## Veri Gecisi

v0.1.5 ve daha eski veriler schema v2'ye otomatik tasinir.

- Settlement, bina, troop, recruitment, project, Treasure ve Event Log kayitlari korunur.
- Eski binalar gercek district slotlarina yerlestirilir.
- Eski Special kategorisi uygun Economic veya Military kategorisine ve Special isaretine donusturulur.
- Eski built-in upkeep degerleri yalnizca eski varsayilanla birebir eslesiyorsa yeni dengeli degerlere tasinir; GM ozel degerleri korunur.
- De Laurent mevcut haliyle oyuncu settlementi olarak kalir.

## Release

Repo:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System
```

Manifest:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/module.json
```

Download:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-vX.Y.Z.zip
```
