package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Role;
import com.unige.encode.encoderestapi.model.TopicType;
import com.unige.encode.encoderestapi.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class RoleServiceImpl implements RoleService{

    @Autowired private RoleRepository roleRepository;

    @Override
    public void saveRole(Role role) {
        roleRepository.save(role);
    }

    @Override
    public void saveAllRole(Collection<Role> roles){
        roleRepository.saveAll(roles);
    }

    @Override
    public Role getRoleById(long id) {
        return roleRepository.getById(id);
    }

    @Override
    public List<Role> getRoleByAssociationTypeId(long associationTypeId){
        return roleRepository.getByAssociationTypeId(associationTypeId);
    }

    @Override
    public void updateRole(Role newRole, Role oldRole) {
        oldRole.setName(newRole.getName());
        oldRole.setDescription(newRole.getDescription());
        saveRole(oldRole);
    }

    @Override
    public void updateRoleTopicTypes(Role role, List<TopicType> topicTypes){
        role.setRoleTopicTypes(topicTypes);
        saveRole(role);
    }


    @Override
    public void deleteRoleById(long id) {
        roleRepository.deleteById(id);
    }

    @Override
    public boolean existsRoleById(long id){
        return roleRepository.existsById(id);
    }
}
