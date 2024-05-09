package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.AssociationScope;
import com.unige.encode.encoderestapi.repository.AssociationScopeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class AssociationScopeServiceImpl implements AssociationScopeService {

    @Autowired AssociationScopeRepository associationScopeRepository;

    @Override
    public void save(AssociationScope associationScope) {
        associationScopeRepository.save(associationScope);
    }

    @Override
    @Transactional
    public void delete(AssociationScope associationScope) {
        AssociationScope s = associationScopeRepository.getById(associationScope.getId());
        associationScopeRepository.delete(s);
    }
}
