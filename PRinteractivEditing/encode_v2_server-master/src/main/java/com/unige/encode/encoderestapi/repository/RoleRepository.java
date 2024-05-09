package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Role getById(long id);
    List<Role> getByAssociationTypeId(long associationTypeId);
    void deleteById(long id);
    boolean existsById(long id);

}
