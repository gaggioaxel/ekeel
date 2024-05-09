package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    User getByEmail(String email);
    Set<User> getAllByEmailIn(List<String> emails);
    List<User> getAllByUsername(String username);
    List<User> getAllByEnabled(boolean enabled);
    List<User> getAllByCreationDateAfter(Timestamp timestamp);
    List<User> getAllByCreationDateBefore(Timestamp timestamp);
    List<User> getAllByCreationDateBetween(Timestamp to, Timestamp from);
    List<User> getAllByAllUserAuthorizations_NameContains(String authorization);
    List<User> findAll();
    void deleteByEmail(String email);
    boolean existsByEmail(String email);

}
