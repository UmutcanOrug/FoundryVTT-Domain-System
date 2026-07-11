# DS: Domain System Kullanim Kilavuzu

DS, Foundry VTT v13 build 351 icin Astargon yerleskelerini uzun vadeli bir Total War dongusuyle yonetir. Varsayilan acilis tusu `K`'dir.

## Erisim ve Ekranlar

- Oyuncu yalnizca kendisine atanmis yerleskeleri gorur.
- GM her yerleske icin profil, isci, insaat, recruitment ve tur notu izinlerini ayri ayri verebilir.
- `Overview`: yerleske ozeti, kuyruklar ve tiklanabilir district kutulari.
- `Town`: yerleske kademesi, profil, POP dagilimi, tamamlanmis binalar ve growth.
- `Construction`: proje kuyrugu, district yonetimi ve bina ailelerinin tum dallari.
- `Recruitment`: basabilir birlikler, recruitment kuyrugu ve regiment kartlari.
- `Chronicle`: oyuncu tur notlari ve ay kayitlari.
- `Rules`: dunya ekonomisi, askeri oranlar, growth, olay ve kademe kurallari.
- `Content Library`: yalnizca GM'in bina, unit ve d100 olay sablonlari.
- `GM Controls`: ay kapatma, dogrudan duzeltmeler, sablonlar, olay kararlari ve geri alma.

## Yerleske Hiyerarsisi

Her bina dugumu 1-5 arasindadir ve bina tieri yerleske kademesiyle aynidir.

| Kademe | Minimum POP | Acik / Azami Slot | Free POP Geliri | Crown | Materials | Food | CP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hamlet | 0 | 3 / 4 | 10 | - | - | - | - |
| Village | 100 | 5 / 7 | 20 | 100.000 | 500 | 500 | 3.000 |
| Town | 500 | 8 / 10 | 30 | 400.000 | 2.500 | 2.000 | 12.000 |
| City | 2.000 | 12 / 14 | 40 | 1.500.000 | 10.000 | 8.000 | 40.000 |
| Metropolis | 8.000 | 16 / 18 | 50 | 5.000.000 | 35.000 | 25.000 | 120.000 |

POP esigine ulasmak otomatik terfi vermez. Town ekranindan progression projesi acilir; kaynaklar pesin odenir ve CP tamamlaninca kademe degisir.

GM, `Settlement Rank` ile bir yerleskeyi masraf ve gereksinim olmadan istedigi kademeye indirebilir veya cikarabilir. Bu islem slotlari yeni kademeye gore tekrar hesaplar ve Chronicle kaydi olusturur.

## POP, Is Gucu ve Manpower

Bir POP yaklasik 10 kisilik bir haneyi/topluluk payini temsil eder. Askerler sivil POP'u eksiltmez; ayni sayisal degeri manpower olarak kullanir:

```text
Civilian POP = Total POP
Free POP = Total POP - Economic Workers - Military Staff
Manpower Cap = floor(Total POP x Manpower Rate) + Manpower Bonus
Available Manpower = Manpower Cap - Current Army Strength - Queued Manpower
```

Varsayilan Manpower Rate yuzde 100'dur. Bu nedenle 309 POP, normalde 309 askerlik manpower cap verir. GM bonus ekleyebilir veya `Manpower Override` ile cap degerini tamamen degistirebilir.

- Her mevcut asker 1 manpower kullanir; recruitment ve replenishment kuyruklari tamamlanana kadar ayni miktari rezerve eder.
- Bina isciligi ile ordu manpoweri birbirine karismaz. Town ekraninda Economic Workers, Military Staff, Free POP, Army Manpower, Manpower Cap ve Available Manpower ayri gorunur.
- Bir binaya gereken iscinin yarisi atanirsa output, recruitment, capacity, defense, public order ve bonuslar yaklasik yuzde 50 calisir.
- Hic isci atanmamis normal bir bina hicbir etki veya recruitment saglamaz. Sifir isci gerektiren binalar tam calisir.

## Ekonomi ve Kaynaklar

Varsayilan temel degerler:

```text
Base Crown Income = Free POP x Settlement Tier Income (10/20/30/40/50)
Gross Crown = (Base Crown + Staffed Building Crown) x Income Multiplier
Net Crown = Gross Crown - Building Upkeep - Army Upkeep
Subsistence Food = Free POP x 0,25
Food Consumption = Total POP x 1 + Army Food + Policy Food + Building Food Upkeep
Food Change = Subsistence + Building Food - Food Consumption
Materials Change = Staffed Building Materials - Building Materials Upkeep
```

Ay islenince Net Crown Treasure'a, Food Change Food deposuna ve Materials Change Materials deposuna eklenir. Food veya Materials sifirin altina inmez. Food acigi growth ve d100 olay zarini kotulestirir; Public Order da duser. Built-in Food binalari Materials, Materials binalari Food uretmez.

Fiyatlar yuksek seviye 5e oyunlarina gore ayarlanmistir. 20.000 Crown genellikle yalnizca bir Hamlet kok binasini karsilar. Town, City ve Metropolis yatirimlari yuz binlerce veya milyonlarca Crown ister. Tam staffed her ekonomik bina, ayni iscileri Free POP birakmaktan daha fazla net Crown ve/veya kendi ana kaynagini saglayacak sekilde dengelenmistir.

GM `Settlement Ledger` icinden POP, Treasure, Food, Materials, Public Order, manpower ve bonus slotlari dogrudan duzeltebilir.

## District Slotlari

Her bina gercek bir district slotunda bulunur.

- `Unlocked`: bina kurulabilir.
- `Purchasable`: oyuncu Crown odeyerek acabilir.
- `GM Locked`: yalnizca GM acabilir.
- `Economic`, `Military` veya `Any Building`: slotun kabul ettigi bina kategorisi.
- `Slot Use`: bazi buyuk binalar bir ana slot ve bir veya daha fazla support slot rezerve eder.
- `Bonus Slots`: bazi binalar yeni Economic veya Military slotlari verir.

Overview'daki bos veya dolu district kutusuna tiklayarak o slota uygun kok bina ya da bir sonraki branch secilebilir. Construction ekrani ayni sistemi daha ayrintili gereksinim ve kuyruk bilgileriyle gosterir.

GM her slotun adini, acma bedelini, kategorisini ve kilidini degistirebilir. `Direct Building Placement`, secilen bina dugumunu ucret ve gereksinim aramadan bos bir slota koyar.

## Bes Tierli Bina Aileleri

`Special` ayri bir kategori degildir. Her bina Economic veya Military olur; benzersiz dugumler ayrica Special yildizi tasiyabilir.

Ekonomik aileler ve renkleri:

- Yesil `Food`: Land Clearance -> Farmstead -> Grain Estate veya Pastoral Ranch -> Grand Granary/Royal Stockyards -> Agrarian Heartland/Royal Pastures.
- Gumus `Materials`: Survey Camp -> Stone Quarry veya Iron Mine -> Masonry/Ironworks -> Builders Guild/Grand Foundry -> Metropolis uretim dugumleri.
- Sari `Commerce`: Trading Post -> Market District veya River Jetty -> Guild ya da Harbor dallari.
- Turkuaz `Civic`: Village Commons -> Tavern Quarter veya Shrine District -> kultur ya da inanc/egitim dallari.

Askeri aileler kirmizi renkle gosterilir:

- `Recruitment`: Muster Field -> Infantry Yard veya Archery Range.
- Infantry Yard, Town seviyesinde `Drill Hall` veya `Stable Compound` secimine ayrilir.
- Archery Range, `Marksmen Range` ve daha sonra `Rangers Lodge` yoluna gider.
- Metropolis sonlari War College, Knightly Order ve Imperial Marksmen Academy'dir.
- `Defense`: Watch Post -> Palisade -> Stone Walls -> Citadel -> Grand Fortress.
- `Siege`: Engineer Camp -> Siege Yard -> Siege Workshop -> Royal Arsenal -> Grand Arsenal.
- `Laurent Estate`: De Laurent icin GM-only, bes tierli ozel estate ailesidir.

Bir familyada `One family per settlement` isaretliyse ayni yerleskede o aileden bir yol bulunur. Bir dugumun dallari ayni slotta birbirini dislar; farkli yol gerekiyorsa GM Content Library'de bu limiti degistirebilir veya uygun ozel bina yaratabilir.

Construction ve Content Library ekranlarinda aileler yukaridan asagi T1-T5 olarak cizilir. Ayni tierdaki secenekler yan yana durur. Bir dugumun uzerine gelince aciklama, parent, maliyet, output ve `Allows recruitment of` bilgileri gorulur.

## Construction ve CP

Bir insaat emri su kontrollerden gecer:

- Slot acik, bos ve dogru kategoride mi?
- Bos slotta secilen bina familyanin root dugumu mu?
- Dolu slotta secilen bina mevcut dugumun dogrudan cocugu mu?
- Yerleske tieri, terrain, biome ve strategic tag gereksinimleri uygun mu?
- Unique family, maksimum adet ve coklu slot kurallari uygun mu?
- Treasure, Materials ve varsa Food yeterli mi?

Kaynaklar proje kuyruga girerken pesin odenir. Sabit bir `3 ayda biter` suresi yoktur:

```text
Construction CP = floor(Free POP x CP / Free POP + Staffed Building CP Bonuses)
ETA = Remaining CP / Expected Monthly CP Share
```

- Yerleske tieri ayni anda kac projenin aktif olabilecegini belirler.
- Aktif projeler `CP Weight` oraninda paylasir.
- Artan CP, Rules ayari aciksa siradaki projeye akar.
- Hired CP tek kullanimliktir; varsayilan bedeli 1 CP icin 100 Crown'dur.
- Iptal iadesi varsayilan yuzde 75'tir ve CP ilerledikce azalir. Crown, Materials ve Food ayni oranla iade edilir.
- GM `Queue Repair` ile bozulmus/import edilmis proje maliyetlerini, odenen kaynaklari, CP'yi ve statusu duzeltebilir.

## Recruitment ve Ordu

Muster Field ilk seviyede Militia ve Watchman/Guard basabilir. Daha gelismis birlikler ilgili bina branchini ister.

Recruitment emrinde kontrol edilenler:

- Kaynak bina aktif, yeterince staffed ve ilgili uniti aciyor mu?
- Aylik recruit kapasitesi yeterli mi?
- Toplam Military Capacity dolu mu?
- Available Manpower yeterli mi?
- Unitin `horses` veya `iron` gibi strategic resource etiketi var mi?
- Unitin settlement maksimum adedi asiliyor mu?
- Treasure toplam recruitment bedelini karsiliyor mu?

Temel upkeep oranlari recruit bedeli uzerinden hesaplanir:

| Unit | Recruit | Garrison / ay | Campaign / ay |
| --- | ---: | ---: | ---: |
| Militia | 150 | 1 | 2 |
| Town Guard | 250 | 1 | 4 |
| Men-at-Arms | 650 | 3 | 10 |
| Archers | 550 | 3 | 8 |
| Heavy Cavalry | 4.000 | 20 | 60 |
| Knights | 10.000 | 50 | 150 |

Tum birliklerde varsayilan Garrison orani yuzde 0,5 ve Campaign orani yuzde 1,5'tir. Rules ile dunya genelinde degistirilebilir. Professional/Militia ayrimi yoktur.

Her recruitment emri kendi regimentini olusturur. Regimentler otomatik birlesmez. Oyuncu izinliyse regiment adini, resmini, Actor baglantisini, notunu, Garrison/Campaign durumunu ve mevcut asker sayisini degistirebilir. Regiment kartlari genis ekranda en fazla iki sutun olur.

### Unit Gucu ve Actor Baglantisi

Her unitte tek bir `Power` degeri bulunur. `Regiment Power = Current Strength x Unit Power` olarak hesaplanir. Bu deger D&D 5e stat blogu degildir; GM'in iki orduyu hizla karsilastirabilmesi icin soyut bir kampanya olcegidir.

### Casualty ve Replenishment

Regiment `Current Strength / Maximum Strength` olarak tutulur. 70 kisilik birlik savasta 12 kayip verirse Current Strength 58 yapilir; Maximum Strength 70 kalir. Recruitment ekranindaki Replenishment cubugu kaybi tamamlar.

- Kaybi basabilen aktif ve staffed bir askeri bina gerekir.
- Her replacement 1 manpower ve aylik recruitment capacity kullanir.
- Varsayilan bedel normal recruit fiyatinin yuzde 35'idir; recruitment discount uygulanabilir.
- Replenishment Maximum Strength'i buyutmez, yalnizca Current Strength'i eski limite getirir.
- Her asker unit tierine gore Food tuketir.

Unit sablonuna veya tek bir regiment/recruitment kaydina Foundry Actor UUID atanabilir. Actor, UUID alanina suruklenip birakilabilir. Karttaki Actor dugmesi bagli Actor sheetini acar. Regiment resmi ve Actor baglantisi global unit sablonundan bagimsiz degistirilebilir.

`Direct GM`, bina, resource, capacity, manpower ve Crown kontrollerini atlar. GM ayrica aninda bos regiment veya duzenlenebilir recruitment kaydi ekleyebilir.

## Growth, Public Order ve Defense

Growth; Base, Safety, Food, Migration, War, Famine, Plague, Tax, Raid, Other, bina bonuslari, Food shortage ve Public Order etkilerinden olusur.

- Varsayilan dunya siniri ayda yuzde -5 ile +5'tir.
- GM yuzdeyi veya dogrudan POP degisimini override edebilir.
- Public Order 0-100 arasindadir. Staffed civic ve defense binalari etkin degeri degistirir.
- Defense, staffed bina defense degeri ile garrison regiment powerinin bir bolumunden gelir.
- Defense ve mitigation etiketleri uygun negatif d100 olay kayiplarini azaltabilir.

### Settlement Policy

Her yerleskede ayni anda bir policy aktif olabilir. Daha guclu secenekler settlement tieriyle acilir:

- `Balanced Administration`: modifier vermez.
- `Expanded Rations`: her POP 1 ek Food tuketir; growth +0,75 ve Public Order +3 alir.
- `Heavy Taxation`: Crown geliri yuzde 25 artar; growth -0,5 ve Public Order -5 olur.
- `War Taxes`: Crown geliri yuzde 10 artar, army upkeep yuzde 25 azalir; growth -0,75 ve Public Order -4 olur.
- `Muster Reserves`: manpower cap yuzde 25 artar; Army Food yuzde 15 artar ve growth -0,25 olur.
- `Public Festivals`: Public Order +10, growth +0,25 ve event roll +2; Crown geliri yuzde 10 azalir.

Town ekranindaki policy paneli secenegin tum tradeofflarini gosterir. Yerleske GM tarafindan daha dusuk tiere indirilirse artik acik olmayan policy otomatik olarak Balanced Administration'a doner.

## Ay Islemi ve d100 Olaylari

GM Controls icinde:

- `World Month`: gorunen sayiyi degistirir; tek basina ekonomi islemez.
- `Process Selected Settlement`: yalnizca secili yerleskeyi mevcut ay icin isler ve dunya ayini artirmaz.
- `Close Global Month`: o ay islenmemis yerleskeleri isler ve dunya ayini bir artirir.
- `Force`: ayni yerleskeyi ayni ayda bilerek tekrar isler.

Yerleske ay sirasi:

1. Tur oncesi snapshot alinir.
2. Free POP ve bina bonusu CP olarak aktif insaatlara dagitilir.
3. Net Crown, Food ve Materials uygulanir.
4. Food durumuna gore Public Order ayarlanir.
5. Recruitment kuyruklari bina kapasitesine gore ilerler.
6. Growth uygulanir.
7. 1d100 ay sonu olayi secilir ve GM onayina birakilir.
8. Islem Chronicle'a yazilir ve yerleske o ay icin processed olur.

d100 sonucu:

```text
Final Roll = 1d100 + Public Order Modifier + Building/Policy Bonus - Food Shortage Penalty
```

Final Roll 1-100 arasinda tutulur. GM `Pending Month Events` kartinda Crown, Food, Materials, POP ve Public Order etkilerini degistirebilir:

- `Apply`: duzenlenmis etkileri uygular.
- `Reroll`: ayni ay icin yeni olay atar ve karti degistirir.
- `Ignore`: olayi kayda alir fakat etki uygulamaz.

Content Library'deki event araliklari cakistirilabilir; ayni sonucu karsilayan birden fazla event varsa sistem uygunlar arasindan birini secer.
Bekleyen bir olay cozulmeden ilgili yerleske yeniden islenemez ve global ay kapatilamaz. Boylece olaylar sessizce ust uste birikmez.

## Tur Geri Alma

Her settlement islemi oncesinde snapshot alinir. `Turn Recovery` listesinden eski snapshot geri yuklenebilir.

Snapshot; tier, POP, Treasure, Food, Materials, Public Order, binalar, regimentler, recruitment, projeler, slotlar, growth, notlar, pending events ve Chronicle kaydini geri getirir. Dunya ay numarasini geri almaz; gerekirse GM World Month'u ayri duzeltir.

Varsayilan saklama sayisi 5'tir ve Rules ekranindan 1-20 arasinda degistirilir.

## Settlement Sablonlari

Hazir sablonlar:

- Blank Hamlet
- Starter Hamlet
- Starter Village
- Starter Town

GM yeni bos sablon yaratabilir veya secili yerleskeyi yeni bir sablon olarak kaydedebilir. Sablonda tier, baslangic POP/kaynaklari, Public Order, manpower bonusu, terrain/biome etiketleri ve binalar tutulur.

De Laurent bir sablon degildir. Normal oyuncu yerleskesidir ve sablon islemleri mevcut De Laurent kaydinin uzerine yazmaz.

## Content Library - GM

Building node alanlari arasinda category, renkli branch, Special, family, tier, parent IDs, settlement tieri, aciklama, terrain, Crown/Materials/Food/CP maliyetleri, workers, tum output/upkeep degerleri, Public Order, Defense, event bonusu, strategic ve mitigation tags, slot use, bonus slots, Military Capacity, recruitment listesi ve resim bulunur.

Unit alanlari arasinda tier, recruit cost, Power, Food consumption, strategic tag, settlement limiti, Special, Actor UUID, aciklama ve resim bulunur. Upkeep dunya yuzdelerinden hesaplanir.

Event alanlari arasinda d100 minimum/maksimum, severity, aciklama, bes kaynak etkisi, defense divisor, mitigation tags ve resim bulunur.

Building kutuphanesinin ust kismi branchleri renkli T1-T5 agacinda gosterir; alttaki editorler ayni branch basliklari altinda gruplanir. `Apply Existing`, bir building veya unit sablonundaki guncel degerleri mevcut instance'lara uygular. Bu dugme geri donusu genis bir islem oldugu icin kullanmadan once ilgili dunya yedegini tutmak iyi bir uygulamadir.

## Veri Gecisi

v0.1.7 ve daha eski veriler schema v4'e otomatik tasinir.

- Yerleske kimligi, sahiplik, bina instance'lari, regimentler, kuyruklar, notlar ve loglar korunur.
- Eski built-in bina kimlikleri yeni ailelerdeki en yakin dugume eslenir.
- Stale Infantry Yard/Stable/Drill Hall parent kayitlari yeni branch yapisiyla yenilenir.
- Professional/Militia ve yedi combat alani tek Military Capacity ve Power sistemine tasinir.
- Regimentlere Maximum Strength, settlementlara policy ve tier bazli gelir alanlari eklenir.
- Metropolis'ten dusurulen yerleskelerde bos eski slotlar yeni tier azamisine kadar daralir; dolu slotlar korunur.
- De Laurent'in bilinen eski binalari Village icin T1-T2 Food, Materials, Commerce ve Estate dugumlerine eslenir; eski T3 ornek projesi iade edilerek kaldirilir.
- Food, Materials, Public Order, manpower, event, policy, replenishment ve snapshot alanlari eksik kayitlara eklenir.
- Hazir Hamlet-Town sablonlari dunya verisine eklenir.
- De Laurent mevcut oyuncu kaydi olarak kalir.

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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.8.zip
```
