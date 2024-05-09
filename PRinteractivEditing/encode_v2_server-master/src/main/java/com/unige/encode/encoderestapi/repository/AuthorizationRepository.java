package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Authorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorizationRepository extends JpaRepository<Authorization, Long> {

    Authorization getById(long id);
    Authorization getByName(String authorizationName);
    void deleteById(long id);

}
