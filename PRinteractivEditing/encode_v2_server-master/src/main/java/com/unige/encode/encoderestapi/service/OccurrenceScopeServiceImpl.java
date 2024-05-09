package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.OccurrenceScope;
import com.unige.encode.encoderestapi.repository.OccurrenceScopeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class OccurrenceScopeServiceImpl implements OccurrenceScopeService {

    @Autowired OccurrenceScopeRepository occurrenceScopeRepository;

    @Override
    public void save(OccurrenceScope occurrencesScope) {
        occurrenceScopeRepository.save(occurrencesScope);
    }

    @Override
    @Transactional
    public void delete(OccurrenceScope occurrencesScope) {
        OccurrenceScope s = occurrenceScopeRepository.getById(occurrencesScope.getId());
        occurrenceScopeRepository.delete(s);
    }
}
