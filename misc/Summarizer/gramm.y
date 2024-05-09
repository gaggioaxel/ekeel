%{
#include<stdio.h>
#include<stdlib.h>
%}

%token PRON 
%token PROPN 
%token NOUN 
%token VERB
%token AUX
%token ADP
%token PART
%token ADJ
%token SEMICOLON
%token COMMA
%token CCOMMA
%token EXCL
%token COLON
%token QUEST
%token NUM
%token SCONJ
%token CCONJ
%token ADV
%token DET
%token TAG
%token NL

/* Rule Section */
%%
S       :       phr TAG { printf("Valid\n"); exit(0); }
        |	TAG
	;
phr	:	phr sn
	|	sn
	;
sn      :       st sn1 advm np sn2 ny scomp vp compl hend                          //avverbi a inizio frase: Suddenly the cat jumped
        ;
sn1	:	ADP {printf("ADP\n");}
    	|
	;
sn2	:	sn2 ADP {printf("ADP\n");} advm np
    	|
	;
st	:	SCONJ {printf("SCONJ\n");}				//If Sam will...
   	|	CCONJ {printf("CCONJ\n");}
	|
	;
scomp	:	ADP {printf("ADP\n");} np				//The dog of the neighbor
      	|
	;
hend	:	COMMA			{ printf("COMMA\n");}
	|	EXCL			{ printf("EXCL\n");}
	|	SEMICOLON {printf("SEMICOLON\n");} sn
	|	QUEST	{printf("QUEST\n");}
	;
np	:	PROPN { printf("PROPN\n");} adjm nounf gen quot 
	|	PRON {printf("PRON\n");} adjm n1
	|	PRON PRON {printf("PRON\nPRON\n");} adjm e2
	|	auxnp surr
//|	dp adjm nounm adjm surr	
	//|	error 	{ YYABORT;}
	//|	ADJ { printf("ADJ\n");} auxnp surr
	|	ADJ { printf("ADJ\n");} n3 adjm surr
	;
gen	:	PART {printf("PART\n");} adjm auxnp
    	|
	;
n1	:	/*advm*/ NOUN {printf("NOUN\n");} nounf adjm
   	|	e2
	;
n3	: 	dp auxnp1 nounf
   	|
	;
auxnp	:	dp auxnp1 nounf adjm
      	//|	DET {printf("DET\n");} advm adjm PROPN {printf("PROPN\n");}
	;
auxnp1	:	NOUN {printf("NOUN\n");}
       	|	NUM {printf("NUM\n");}
	;
e2	:  	NUM {printf("NUM\n");} adjm NOUN {printf("NOUN\n");} nounf adjm surr
   	//|	adjm nounm adjm surr
   	|
	;
quot	:	CCOMMA	{printf("CCOMMA\n");} np
	|	COLON {printf("COLON\n");} quot2 advm nps vp quot1 nps COLON {printf("COLON\n");}
	|
	;
quot1	:	ADP {printf("ADP\n");}
      	|
	;
quot2	:	ADP {printf("ADP\n");}
      	|	SCONJ {printf("SCONJ\n");}
	|
	;
nps	:	auxnp	    
    	|	PROPN {printf("PROPN\n");} nps
	|	PROPN {printf("PROPN\n");} 
	|	PRON {printf("PRON\n");} adjm NOUN {printf("NOUN\n");}
	|	PRON {printf("PRON\n");}
	;
dp	:	DET { printf("DET\n");} advm adjm e1
	|	
	;
e1	:	NUM			{ printf("NUM\n");}
	|	DET			{ printf("Unexpected DET after DET-like token\n"); YYABORT;}
	|	PRON 			{ printf("Unexpected PRON after DET-like token\n"); YYABORT;}
	|	ADP			{ printf("A noun is missing after DET-like token\n"); YYABORT;}
	|	AUX			{ printf("A noun is missing after DET-like token\n"); YYABORT;}
	|	CCONJ			{ printf("A noun is missing after DET-like token\n"); YYABORT;}
	|	PART			{ printf("A noun is missing after DET-like token\n"); YYABORT;}
	|	SCONJ			{ printf("A noun is missing after DET-like token\n"); YYABORT;}	
	|
	;
surr    :       COLON quot2 { printf("COLON\n");} nps surr		//The cat, the dog
	|	COLON CCONJ {printf("COLON\nCCONJ\n");} nps 
	|       CCONJ { printf("CCONJ\n");} nps			//and the mouse
        |	COLON PART ADP VERB {printf("COLON\nPART\nADP\nVERB\n");} nps
	|
	;
adjm    :       adjm ADJ 		{ printf("ADJ\n");}
        |	
        ;
/*nounm   :       NOUN {printf("NOUN\n");} nounf
        |       error                   { YYABORT;}
        ;*/
nounf   :       nounf adjm auxf 
	|
	;
auxf	:	/*DET NOUN PRON		{ printf("DET\nNOUN\nPRON\n");}
     	|*/	DET NOUN		{ printf("DET\nNOUN\n");}
     	//|	NOUN PRON		{ printf("NOUN\nPRON\n");}
	|	NOUN			{ printf("NOUN\n");}
	|	PROPN			{ printf("PROPN\n");}
	|	PRON			{ printf("PRON\n");}
	;
vp	:	vp an vp1
	|	vp1
   	;
an	:	CCONJ	{printf("CCONJ\n");}
   	|	COLON	{printf("COLON\n");} 
	;
vp1	:	advm fork
    	;
vp2	:	fork
    	;
fork	:	AUX {printf("AUX\n");} neg advm fork1 	
     	|	VERB { printf("VERB\n");} advm pv
	|	error			{ yyerror("A verb is missing"); YYABORT;}
	;
fork1	:	AUX {printf("AUX\n");} advm vpr advm pv
      	|	VERB {printf("VERB\n");} advm pv
	//|	ADJ {printf("ADJ\n");}
	|
	;
neg	:	PART			{ printf("PART\n");}
    	|
	;
vpr	:	VERB			{ printf("VERB\n");}
    	|	error			{ yyerror("A verb is missing"); YYABORT;}
	;
pv      :       PART AUX VERB {printf("PART\nAUX\nVERB\n");} pv1 advm
        |       PART VERB {printf("PART\nVERB\n");} pv1 advm 
	|
        ;
pv1	:	VERB {printf("VERB\n");}
    	|
	;
advm    :  	advm ADV		{ printf("ADV\n");} 
	|	
        ;
compl   :      /* np vp compl
        //|       auxcompl compl1      	
        |*/	np ny vp compl1
	|	np ny compl1
	|	compl1
	;
ad	:	/*ADP ADV ADP {printf("ADP\nADV\nADP\n");}
  	|*/	ADP {printf("ADP\n");} advm quot1
	;
sco	:	SCONJ			{printf("SCONJ\n");}
    	;
compl1	:	compl1 auxcompl
	|
	;
cl	:	COLON CCONJ {printf("COLON\nCCONJ\n");}
   	|	COLON {printf("COLON\n");}
   	|
	;
compl2	:	compl3 
	|
	;
compl3	:	np ny vp cl compl2
        |	np ny
	;
auxcompl:	auxcompl1
	| 	ad auxcompl3
	|	ad vp2 cl np ny
	|	ADP	{printf("ADP\n");}
	;
ny	:	PART {printf("PART\n");} advm ny1
	|	PART PROPN {printf("PART\nPROPN\n");} 
	|
	;
ny1	:	ADJ {printf("ADJ\n");}
    	|	vp2 np
	;
auxcompl1:	sco auxcompl3
	|	sco vp
	;
auxcompl3:	np ny auxcompl4
	|	np ny
	; 
auxcompl4:	vp cl compl2
	;
%%
//C routine
int yyerror(char *msg)
{
        printf("%s\n", msg);
}

//driver code
main()
{
        printf("Enter a string followed by #\n");
        yyparse();
}

