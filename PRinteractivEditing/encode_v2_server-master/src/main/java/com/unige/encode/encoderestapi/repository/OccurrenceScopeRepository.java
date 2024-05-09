package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.OccurrenceScope;
import com.unige.encode.encoderestapi.model.OccurrenceScopePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccurrenceScopeRepository extends JpaRepository<OccurrenceScope, OccurrenceScopePK> {

    OccurrenceScope getById(OccurrenceScopePK pk);

}
