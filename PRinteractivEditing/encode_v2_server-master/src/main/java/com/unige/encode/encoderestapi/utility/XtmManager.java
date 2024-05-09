package com.unige.encode.encoderestapi.utility;

import com.unige.encode.encoderestapi.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.Collection;

@Component("xtmManager")
public class XtmManager {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

  /*  public String generateXtmFromTopicMap(Topicmap topicmap){
        String xtm = null;
        DocumentBuilderFactory documentBuilderFactory= null;
        DocumentBuilder documentBuilder = null;
        try{
            documentBuilderFactory  = DocumentBuilderFactory.newInstance();
            documentBuilder = documentBuilderFactory.newDocumentBuilder();
            Document document = documentBuilder.newDocument();
            Element mainRootElement = document.createElementNS("http://www.topicmaps.org/xtm/", "TopicMap");
            mainRootElement.setAttribute("Version", "2.0");
            // append child elements to root element
            document.appendChild(mainRootElement);
            Collection<Topic> topics = topicmap.getAllTopics();
            if(!topics.isEmpty()){
                for(Topic topic: topics){
                    mainRootElement.appendChild(getTopicNode(document, topic, mainRootElement));
                }
            }

            // output DOM XML to console and write it in a String that is returned with an HTTP response
            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.METHOD, "xml");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");
            DOMSource source = new DOMSource(document);
            StreamResult console = new StreamResult(System.out);
            transformer.transform(source, console);
            StringWriter writer = new StringWriter();
            StreamResult result = new StreamResult(writer);
            transformer.transform(source, result);
            xtm = writer.toString();

            logger.info("XML DOM Created Successfully..");

        }catch(ParserConfigurationException e) {
            e.printStackTrace();
            logger.error("An error occurred during TopicMap xtm generation: {}.", e);
        }catch (TransformerException e){
            e.printStackTrace();
            logger.error("An error occurred during TopicMap xtm generation: {}.", e);
        }catch (Exception e){
            e.printStackTrace();
            logger.error("An error occurred during TopicMap xtm generation: {}.", e);
        }
        logger.info(xtm);
        return xtm;
    }

    //Create a <Topic> xml node
    private static Node getTopicNode(Document docXtm, Topic topic, Element mainRootElement){

        Element topicElement = docXtm.createElement("Topic");
        topicElement.setAttribute("id", Long.toString(topic.getId()));

        Element subjectLocElement = docXtm.createElement("subjectLocator");
        subjectLocElement.setAttribute("href", topic.getSubjectLocator());
        topicElement.appendChild(subjectLocElement);

        Element subjectIdElement = docXtm.createElement("subjectIdentifier");
        subjectIdElement.setAttribute("href", topic.getSubjectIdentifier());
        topicElement.appendChild(subjectIdElement);

        Element instanceOfElement = docXtm.createElement("instanceOf");
        topicElement.appendChild(instanceOfElement);
        Collection<LinkedTopics> topicRefs = topic.getAllLinksOnOut();
        if(!topicRefs.isEmpty()) {

            for (LinkedTopics instance : topicRefs) {
                instanceOfElement.appendChild(getInstanceOfTopicNode(docXtm, instance));
            }
        }

        Element nameElement = docXtm.createElement("name");
        Element valueElement = docXtm.createElement("value");
        nameElement.appendChild(valueElement);
        valueElement.appendChild(docXtm.createTextNode(topic.getName()));

        Element variantElement = docXtm.createElement("variant");
        Element scopeElement = docXtm.createElement("scope");
        variantElement.appendChild(scopeElement);
        Collection<Scope> scopes = topic.getAllScopeOfTopic();
        if(!scopes.isEmpty()){
            for(Scope scope: scopes)
                scopeElement.appendChild(getScopeOfTopicNode(docXtm, scope));
        }
        Element resourceElement = docXtm.createElement("resourceData");
        *//*if(topic.getVarNameTopic() != null) {
            resourceElement.appendChild(docXtm.createTextNode(topic.getVarNameTopic().getVariantName()));
        }*//*
        variantElement.appendChild(resourceElement);
        nameElement.appendChild(variantElement);
        Element occurrenceElement = docXtm.createElement("occurrence");
        Collection<Occurrence> occurrences = topic.getTopicOccurrences();
        topicElement.appendChild(occurrenceElement);
        Element typeElement = docXtm.createElement("type");
        Element scopeOcc = docXtm.createElement("scope");
        Element dataValueElement = docXtm.createElement("dataValue");
        Element dataReferenceElement = docXtm.createElement("dataReference");
        if(!occurrences.isEmpty()){
            for(Occurrence occurrence:occurrences) {
                typeElement.appendChild(docXtm.createTextNode(occurrence.getOccurrenceType().getOccurrenceTypeName()));
                occurrenceElement.appendChild(typeElement);
                occurrenceElement.appendChild(getOccurrenceOfTopicNode(docXtm, occurrence));
                occurrenceElement.appendChild(scopeOcc);
                for(OccurrencesScope scope: occurrence.getScopefOccurrence())
                    scopeOcc.appendChild(getScopeOfTopicNode(docXtm, scope));

                dataValueElement.appendChild(docXtm.createTextNode(occurrence.getDataValue()));
                occurrenceElement.appendChild(dataValueElement);
                dataReferenceElement.appendChild(docXtm.createTextNode(occurrence.getDataReference()));
                occurrenceElement.appendChild(dataReferenceElement);
            }

        }
        topicElement.appendChild(nameElement);
        topicElement.appendChild(occurrenceElement);
        return topicElement;
    }

    //Create a <Instance> xml node
    private static Node getInstanceOfTopicNode(Document docXtm, LinkedTopics instance){
        Element topicRefElement = docXtm.createElement("topicRef");
        topicRefElement.setAttribute("href", Long.toString(instance.getId()));
        //instanceOfElement.appendChild(topicRef);
        return topicRefElement;
    }

    //Create a <Scope> xml node
    private static Node getScopeOfTopicNode(Document docXtm, OccurrencesScope scope){
        Element scopeRefElement = docXtm.createElement("scopeRef");
        //scopeRefElement.setAttribute("href", Long.toString(scope.getScopedTopic().getId()));
        Element e = docXtm.createElement("id");
        e.appendChild(docXtm.createTextNode(scope.getId().getScopeName()));
        scopeRefElement.appendChild(e);
        e = docXtm.createElement("name");
        e.appendChild(docXtm.createTextNode(scope.getId().getScopeName()));
        scopeRefElement.appendChild(e);
        e = docXtm.createElement("description");
        //e.appendChild(docXtm.createTextNode(scope.getDescription()));
        scopeRefElement.appendChild(e);
       *//* if(scope.getScopeEffort() != null){
            scopeRefElement.appendChild(getEffortOfScopeNode(docXtm, scope.getScopeEffort()));
        }*//*

        return scopeRefElement;
    }

    //Create a <Occurrence> xml node
    private static Node getOccurrenceOfTopicNode(Document docXtm, Occurrence occurrence){
        Element typeElement = docXtm.createElement("topicRef");
        typeElement.setAttribute("href", Long.toString(occurrence.getOccurrenceOfTopic().getId()));
        return typeElement;
    }

    //Create a <Effort> xml node
    private static Node getEffortOfScopeNode(Document docXtm, Effort effort){
        Element effortElement = docXtm.createElement("effort");
        effortElement.setAttribute("id", Long.toString(effort.getId()));
        //Element e = docXtm.createElement("id");
        //e.appendChild(docXtm.createTextNode(Long.toString(effort.getId())));
        //effortElement.appendChild(e);
        Element e = docXtm.createElement("effortType");
        e.appendChild(docXtm.createTextNode(effort.getType()));
        effortElement.appendChild(e);
        e = docXtm.createElement("effortQuantity");
        e.appendChild(docXtm.createTextNode(effort.getEffort()));
        effortElement.appendChild(e);
        return effortElement;
    }*/
}
