; TCD - Microcontroladores
; Alexandre de Tomy Silva - 151025916
	
#include "p16f873a.inc"
; Configuracao de bits
__CONFIG    _FOSC_XT & _WDTE_OFF & _PWRTE_OFF & _BOREN_OFF & _LVP_OFF & _CPD_OFF & _WRT_OFF & _CP_OFF	
				
	; Variaveis
	CBLOCK	0x20
	    tics			; Contador interrupcoes por minuto
	    giro			; Variavel que controla giro do motor
	    passo			; Variavel que define o tamanho do passo do motor
	    aux_for1			; Variavel auxilia for
	    aux_for2			; Variavel auxilia for
	ENDC
	
	ORG	0
	GOTO	init			; Inicio do programa
	
;-----Interrupcoes
	ORG	4
	BANKSEL INTCON
	BTFSS   INTCON, TMR0IF	; Se interrupcao nao foi do timer, volta
	GOTO    	_retfie
	
	DECFSZ	tics,1			; tics = 0 ?
	GOTO	loop
	
	MOVLW	d'20'
	MOVWF   	tics		; Reseta contador de interrupcoes
	
	CALL	gira			; Rotina para girar o motor
	GOTO	loop
;	
_retfie:
	RETFIE

init:
	CALL	configura
	MOVLW	d'12'
	MOVWF	giro
	MOVLW	d'1'
	MOVWF	passo
		
loop:	
	BANKSEL INTCON
	MOVLW   b'10100000'
	MOVWF   INTCON	
	
	; Recebe via serial (bluetooth)
	BANKSEL	PIR1
	BTFSS	PIR1, RCIF		; Testa bit de recepcao (1 se recebeu)
	GOTO	loop			; Se 0, volta para o loop

	BANKSEL RCREG
	MOVF	RCREG, W
	SUBLW	d'1'
	BTFSS	STATUS, Z
	GOTO	loop

	INCF	giro,1
	GOTO	loop
	
;ROTINAS------------------------------------------------------------------------

gira:
	BANKSEL PORTB	
	BSF	PORTB, RB0		; Liga motor apos 20ms
	CALL	delay			; Rotina de delay (1-2 us)
	BCF	PORTB, RB0		; Desliga motor ate novo pulso
	BANKSEL	PORTB
	BCF	PORTB, RB1
RETURN
	
delay:					; (2 + ((6 + NOPJ)*J) + NOPI + 6)*I = X us
	MOVLW	D'0'			
	MOVWF	aux_for1
for1:	
	MOVlW	d'0'		; 1 us
	MOVWF	aux_for2	; 1 us
	for2:
	    INCF    	aux_for2,1	; 1 us
	    MOVF    	aux_for2,W	; 1 us
	    SUBWF  	giro, 0	    	; 1 us
	    BTFSS   	STATUS,Z	; 1 us
	    GOTO	for2	    	; 2 us
	
	INCF	aux_for1,1 	; 1 us	
	MOVF	aux_for1,W	; 1 us		
	SUBLW	D'10'			; 1 us	
	BTFSS	STATUS,Z	; 1 us	
	GOTO	for1		; 2 us	
RETURN

configura:
	; Configurar serial
	BANKSEL	TXSTA			; Registrador de transmissao
	MOVLW	b'00100110' 
	MOVWF	TXSTA  
	BANKSEL	RCSTA 			; Registrador de recepcao
	MOVLW	b'10010000' 
;	MOVLW	b'10000000'
	MOVWF	RCSTA 
	BANKSEL	SPBRG 			; -> Para obter BPS
	MOVLW	d'25' 	
	MOVWF	SPBRG			; -> baud = 9600

	; Configura timer
	BANKSEL OPTION_REG
	MOVLW	b'10000010'		; prescaler = 4

	MOVWF   OPTION_REG
	BANKSEL TMR0
	MOVLW   d'131'			; -> 1000 interrupcoes por segundo
	MOVWF   TMR0
	
	; Configura portas
	BANKSEL TRISB	
	MOVLW	b'11111100'
	MOVWF	TRISB
	BANKSEL PORTB		
	MOVLW	d'0'		
	MOVWF	PORTB			; Zera porta b
RETURN
	
;-------------------------------------------------------------------------------
END
