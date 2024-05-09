package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.AssociationScope;
import com.unige.encode.encoderestapi.model.AssociationScopePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssociationScopeRepository extends JpaRepository<AssociationScope, AssociationScopePK> {

    AssociationScope getById(AssociationScopePK pk);

}