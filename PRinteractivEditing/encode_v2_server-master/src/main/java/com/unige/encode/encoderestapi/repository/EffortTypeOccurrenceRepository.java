package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.EffortTypeOccurrence;
import com.unige.encode.encoderestapi.model.EffortTypeOccurrencePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EffortTypeOccurrenceRepository extends JpaRepository<EffortTypeOccurrence, EffortTypeOccurrencePK> {

    EffortTypeOccurrence getById(EffortTypeOccurrencePK pk);

}

