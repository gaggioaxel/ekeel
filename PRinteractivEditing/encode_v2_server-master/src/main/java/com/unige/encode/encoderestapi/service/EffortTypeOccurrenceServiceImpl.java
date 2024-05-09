package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.EffortTypeOccurrence;
import com.unige.encode.encoderestapi.repository.EffortTypeOccurrenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class EffortTypeOccurrenceServiceImpl implements EffortTypeOccurrenceService {

    @Autowired EffortTypeOccurrenceRepository effortTypeOccurrenceRepository;

    @Override
    public void save(EffortTypeOccurrence effortTypeOccurrence) {
        effortTypeOccurrenceRepository.save(effortTypeOccurrence);
    }

    @Override
    @Transactional
    public void delete(EffortTypeOccurrence effortTypeOccurrence) {
        EffortTypeOccurrence s = effortTypeOccurrenceRepository.getById(effortTypeOccurrence.getId());
        effortTypeOccurrenceRepository.delete(s);
    }
}
