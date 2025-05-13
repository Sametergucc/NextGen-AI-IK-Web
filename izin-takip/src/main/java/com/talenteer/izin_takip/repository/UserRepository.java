package com.talenteer.izin_takip.repository;

import com.talenteer.izin_takip.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
} 