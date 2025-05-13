package com.talenteer.izin_takip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;

@SpringBootApplication
public class IzinTakipApplication {

	public static void main(String[] args) {
		// Her başlatmada veritabanı dosyasını sil
		File dbFile = new File("data/izintakipdb.mv.db");
		if (dbFile.exists()) {
			boolean deleted = dbFile.delete();
			if (deleted) {
				System.out.println("Veritabanı dosyası silindi: " + dbFile.getAbsolutePath());
			} else {
				System.out.println("Veritabanı dosyası silinemedi: " + dbFile.getAbsolutePath());
			}
		}
		SpringApplication.run(IzinTakipApplication.class, args);
	}

}
