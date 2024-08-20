const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { format, parse } = require('date-fns');
const { tr } = require('date-fns/locale');
const fs = require('fs');

const url = 'https://www.flightlist.io/';

fetch(url)
  .then(response => response.text())
  .then(body => {
    const $ = cheerio.load(body);
    const flightData = [];

    $('li.flight').each((index, element) => {
      let price = $(element).find('.price').text().trim();
      const airline = $(element).find('img').attr('alt');
      const timeRange = $(element).find('.reduced').text().trim();
      let date = $(element).find('.text-muted').first().text().trim();
      let duration = $(element).find('.col-xs-5.col-sm-5.col-md-5').first().text().trim().split('\n')[0].trim();
      const route = $(element).find('.col-xs-5.col-sm-5.col-md-5').find('.text-muted').text().trim();
      const direct = $(element).find('.col-xs-2.col-sm-2.col-md-2.px-0').text().trim();

      // Fiyatı USD olarak ayarla
      price = `${price} USD`;

      // Tarihi Türkçe'ye çevir
      let parsedDate;
      try {
        parsedDate = parse(date, 'EEE MMM do yyyy', new Date());
        date = format(parsedDate, 'd MMMM yyyy, EEEE', { locale: tr });
      } catch (error) {
        console.error('Tarih parse edilirken hata oluştu:', error);
        date = 'Geçersiz tarih';  // or any default/fallback value
      }

      // Süreyi Türkçe'ye çevir
      const durationParts = duration.match(/(\d+)h\s+(\d+)m/);
      if (durationParts) {
        const hours = parseInt(durationParts[1], 10);
        const minutes = parseInt(durationParts[2], 10);
        duration = `${hours} saat ${minutes} dakika`;
      } else {
        duration = 'Geçersiz süre';  // or any default/fallback value
      }

      flightData.push({
        fiyat: price,
        havayolu: airline,
        zamanaralik: timeRange,
        tarih: date,
        sure: duration,
        guzergah: route,
        direkt: direct,
      });
    });

    // JSON çıktısını veri.json dosyasına kaydet
    fs.writeFile('veri.json', JSON.stringify(flightData, null, 2), (err) => {
      if (err) {
        console.error('Dosya kaydedilirken hata oluştu:', err);
      } else {
        console.log('Veri başarıyla veri.json dosyasına kaydedildi.');
      }
    });
  })
  .catch(error => {
    console.error('Hata:', error);
  });
