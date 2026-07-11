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

| Kademe | Minimum POP | Acik / Azami Slot | Crown | Materials | Food | CP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Hamlet | 0 | 3 / 4 | - | - | - | - |
| Village | 100 | 5 / 7 | 100.000 | 500 | 500 | 3.000 |
| Town | 500 | 8 / 10 | 400.000 | 2.500 | 2.000 | 12.000 |
| City | 2.000 | 12 / 14 | 1.500.000 | 10.000 | 8.000 | 40.000 |
| Metropolis | 8.000 | 16 / 18 | 5.000.000 | 35.000 | 25.000 | 120.000 |

POP esigine ulasmak otomatik terfi vermez. Town ekranindan progression projesi acilir; kaynaklar pesin odenir ve CP tamamlaninca kademe degisir.

GM, `Settlement Rank` ile bir yerleskeyi masraf ve gereksinim olmadan istedigi kademeye indirebilir veya cikarabilir. Bu islem slotlari yeni kademeye gore tekrar hesaplar ve Chronicle kaydi olusturur.

## POP, Is Gucu ve Manpower

Toplam POP dort farkli yerde kullanilir:

```text
Civilian POP = Total POP - Raised Army POP
Free POP = Civilian POP - Economic Workers - Military Staff
Manpower Pool = floor(Free POP x Manpower Rate) + Manpower Bonus
Available Manpower = Manpower Pool - Queued Recruitment Manpower
```

Varsayilan Manpower Rate yuzde 25'tir. GM bir bonus ekleyebilir veya `Manpower Override` ile hesaplanan havuzu tamamen degistirebilir.

- Regimentteki asker, unit sablonundaki `Manpower / Troop` kadar POP kullanir.
- Kuyruktaki recruitment manpower rezerve eder; tamamlaninca regiment POP'u olur.
- Bina isciligi ile ordu POP'u birbirine karismaz. Town ekraninda Civilian, Economic Workers, Military Staff, Free POP, Army POP ve manpower ayri satirlarda gorunur.
- Bir binaya gereken iscinin yarisi atanirsa output, recruitment, capacity, defense, public order ve bonuslar yaklasik yuzde 50 calisir.
- Hic isci atanmamis normal bir bina hicbir etki veya recruitment saglamaz. Sifir isci gerektiren binalar tam calisir.

## Ekonomi ve Kaynaklar

Varsayilan temel degerler:

```text
Base Crown Income = Free POP x 25
Gross Crown = (Base Crown + Staffed Building Crown) x Income Multiplier
Net Crown = Gross Crown - Building Upkeep - Army Upkeep
Subsistence Food = Free POP x 0,25
Food Consumption = Total POP x 1 + Building Food Upkeep
Food Change = Subsistence + Building Food - Food Consumption
Materials Change = Staffed Building Materials - Building Materials Upkeep
```

Ay islenince Net Crown Treasure'a, Food Change Food deposuna ve Materials Change Materials deposuna eklenir. Food veya Materials sifirin altina inmez. Food acigi growth ve d100 olay zarini kotulestirir; Public Order da duser.

Fiyatlar yuksek seviye 5e oyunlarina gore ayarlanmistir. 20.000 Crown genellikle yalnizca bir Hamlet kok binasini karsilar. Town, City ve Metropolis yatirimlari yuz binlerce veya milyonlarca Crown ister. Bu nedenle oyuncu bol GP alsa bile yerleske uzun vadeli bir para havuzu olarak kalir.

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

Ekonomik aileler:

- `Land`: Land Clearance -> Farmstead -> Grain Estate, Tannery veya Horse Ranch dallari -> City ve Metropolis uzmanlasmalari.
- `Resources`: Survey Camp -> Stone Quarry veya Iron Mine -> Masonry veya Ironworks dallari.
- `Commerce`: Trading Post -> Market District veya River Jetty -> Guild ya da Harbor dallari.
- `Civic`: Village Commons -> Tavern Quarter veya Shrine District -> kultur ya da inanc/egitim dallari.

Askeri aileler:

- `Recruitment`: Muster Field -> Infantry Yard veya Archery Range.
- Infantry Yard, Town seviyesinde `Drill Hall` veya `Stable Compound` secimine ayrilir.
- Archery Range, `Marksmen Range` ve daha sonra `Rangers Lodge` yoluna gider.
- Metropolis sonlari War College, Knightly Order ve Imperial Marksmen Academy'dir.
- `Defense`: Watch Post -> Palisade -> Stone Walls -> Citadel -> Grand Fortress.
- `Siege`: Engineer Camp -> Siege Yard -> Siege Workshop -> Royal Arsenal -> Grand Arsenal.
- `Laurent Estate`: De Laurent icin GM-only, bes tierli ozel estate ailesidir.

Bir familyada `One family per settlement` isaretliyse ayni yerleskede o aileden bir yol bulunur. Bir dugumun dallari ayni slotta birbirini dislar; farkli yol gerekiyorsa GM Content Library'de bu limiti degistirebilir veya uygun ozel bina yaratabilir.

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
- Professional veya Militia capacity dolu mu?
- Available Manpower yeterli mi?
- Unitin `horses` veya `iron` gibi strategic resource etiketi var mi?
- Unitin settlement maksimum adedi asiliyor mu?
- Treasure toplam recruitment bedelini karsiliyor mu?

Temel upkeep oranlari recruit bedeli uzerinden hesaplanir:

| Unit | Recruit | Garrison / ay | Campaign / ay |
| --- | ---: | ---: | ---: |
| Militia | 150 | 2 | 6 |
| Watchman / Guard | 350 | 11 | 28 |
| Man-at-Arms | 800 | 24 | 64 |
| Archer | 700 | 21 | 56 |
| Cavalry Trooper | 3.000 | 90 | 240 |
| Knight | 7.000 | 210 | 560 |

Professional varsayilanlari Garrison yuzde 3 ve Campaign yuzde 8; Militia varsayilanlari yuzde 1 ve yuzde 4'tur. Rules ile degistirilebilir. Bir unit sabit upkeep kullanacak sekilde de ayarlanabilir.

Her recruitment emri kendi regimentini olusturur. Regimentler otomatik birlesmez. Oyuncu izinliyse regiment adini, resmini, notunu ve Garrison/Campaign durumunu degistirebilir. Regiment kartlari genis ekranda en fazla iki sutun olur.

### Unit Gucu ve Actor Baglantisi

Her unitte Quality ile birlikte Melee, Ranged, Defense, Morale, Mobility, Charge ve Siege 0-10 degerleri bulunur. Sistem bunlardan bir `Combat` degeri, asker sayisindan da Regiment Power hesaplar. Bu deger D&D 5e stat blogu degildir; GM'in iki orduyu hizla karsilastirabilmesi icin soyut bir kampanya olcegidir.

Unit sablonuna veya tek bir regiment/recruitment kaydina Foundry Actor UUID atanabilir. Actor, UUID alanina suruklenip birakilabilir. Karttaki Actor dugmesi bagli Actor sheetini acar. Regiment resmi ve Actor baglantisi global unit sablonundan bagimsiz degistirilebilir.

`Direct GM`, bina, resource, capacity, manpower ve Crown kontrollerini atlar. GM ayrica aninda bos regiment veya duzenlenebilir recruitment kaydi ekleyebilir.

## Growth, Public Order ve Defense

Growth; Base, Safety, Food, Migration, War, Famine, Plague, Tax, Raid, Other, bina bonuslari, Food shortage ve Public Order etkilerinden olusur.

- Varsayilan dunya siniri ayda yuzde -5 ile +5'tir.
- GM yuzdeyi veya dogrudan POP degisimini override edebilir.
- Public Order 0-100 arasindadir. Staffed civic ve defense binalari etkin degeri degistirir.
- Defense, staffed bina defense degeri ile garrison regiment powerinin bir bolumunden gelir.
- Defense ve mitigation etiketleri uygun negatif d100 olay kayiplarini azaltabilir.

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
Final Roll = 1d100 + Public Order Modifier + Building Event Bonus - Food Shortage Penalty
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

Building node alanlari arasinda category, Special, family, tier, parent IDs, settlement tieri, terrain, Crown/Materials/Food/CP maliyetleri, workers, tum output/upkeep degerleri, Public Order, Defense, event bonusu, strategic ve mitigation tags, slot use, bonus slots, capacity, recruitment listesi ve resim bulunur.

Unit alanlari arasinda role, tier, quality, recruit/upkeep, manpower, yedi combat degeri, power modifier, strategic tag, settlement limiti, Special, Actor UUID ve resim bulunur.

Event alanlari arasinda d100 minimum/maksimum, severity, aciklama, bes kaynak etkisi, defense divisor, mitigation tags ve resim bulunur.

`Apply Existing`, bir building veya unit sablonundaki guncel degerleri mevcut instance'lara uygular. Bu dugme geri donusu genis bir islem oldugu icin kullanmadan once ilgili dunya yedegini tutmak iyi bir uygulamadir.

## Veri Gecisi

v0.1.6 ve daha eski veriler schema v3'e otomatik tasinir.

- Yerleske kimligi, sahiplik, bina instance'lari, regimentler, kuyruklar, notlar ve loglar korunur.
- Eski built-in bina kimlikleri yeni ailelerdeki en yakin dugume eslenir.
- Eski default upkeep degerleri yeni yuksek ekonomi dengesine tasinir; GM tarafindan ozellestirilmis degerler korunur.
- Food, Materials, Public Order, manpower, event ve snapshot alanlari eksik kayitlara eklenir.
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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.7.zip
```
