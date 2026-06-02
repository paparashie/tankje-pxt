/**
 * Blokken voor het RobotBit tankje
 */
//% weight=100 color=#0f8f2f icon="\uf1b9" block="Tankje"
namespace Tankje {
    export enum TankjeKleur {
        //% block="rood"
        Rood,
        //% block="paars"
        Paars,
        //% block="blauw"
        Blauw,
        //% block="groen"
        Groen,
        //% block="geel"
        Geel
    }

    let strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)

    let basisR = 0
    let basisG = 80
    let basisB = 255
    let ledAnimatieAan = false

    // Pas deze eventueel later aan als je de ultrasone sensor op andere pinnen zet
    let trigPin = DigitalPin.P1
    let echoPin = DigitalPin.P2

    function vooruitZonderTimer() {
        robotbit.Servo(robotbit.Servos.S1, 70)
        robotbit.Servo(robotbit.Servos.S2, 130)
    }

    /**
     * Stop het tankje
     */
    //% block="stop"
    //% weight=90
    export function stop(): void {
        robotbit.Servo(robotbit.Servos.S1, 100)
        robotbit.Servo(robotbit.Servos.S2, 100)
    }

    /**
     * Laat het tankje vooruit rijden
     */
    //% block="vooruit %seconden seconden"
    //% seconden.defl=2
    //% weight=100
    export function vooruit(seconden: number): void {
        robotbit.Servo(robotbit.Servos.S1, 70)
        robotbit.Servo(robotbit.Servos.S2, 130)
        basic.pause(seconden * 1000)
        stop()
    }

    /**
     * Laat het tankje achteruit rijden
     */
    //% block="achteruit %seconden seconden"
    //% seconden.defl=2
    //% weight=99
    export function achteruit(seconden: number): void {
        robotbit.Servo(robotbit.Servos.S1, 130)
        robotbit.Servo(robotbit.Servos.S2, 70)
        basic.pause(seconden * 1000)
        stop()
    }

    /**
     * Laat het tankje links draaien
     */
    //% block="draai links %seconden seconden"
    //% seconden.defl=1
    //% weight=98
    export function draaiLinks(seconden: number): void {
        robotbit.Servo(robotbit.Servos.S1, 70)
        robotbit.Servo(robotbit.Servos.S2, 70)
        basic.pause(seconden * 1000)
        stop()
    }

    /**
     * Laat het tankje rechts draaien
     */
    //% block="draai rechts %seconden seconden"
    //% seconden.defl=1
    //% weight=97
    export function draaiRechts(seconden: number): void {
        robotbit.Servo(robotbit.Servos.S1, 130)
        robotbit.Servo(robotbit.Servos.S2, 130)
        basic.pause(seconden * 1000)
        stop()
    }

    /**
     * Korte toeter
     */
    //% block="toeter kort"
    //% weight=80
    export function toeterKort(): void {
        pins.analogPitch(440, 200)
        basic.pause(80)
        pins.analogPitch(440, 200)
    }

    /**
     * Lange toeter
     */
    //% block="toeter lang"
    //% weight=79
    export function toeterLang(): void {
        pins.analogPitch(523, 160)
        basic.pause(20)
        pins.analogPitch(659, 160)
        basic.pause(30)
        pins.analogPitch(784, 160)
        basic.pause(30)
        pins.analogPitch(1047, 260)
        basic.pause(40)
        pins.analogPitch(784, 100)
        basic.pause(40)
        pins.analogPitch(1047, 350)
    }

    function kiesLedKleur(kleur: TankjeKleur): void {
        if (kleur == TankjeKleur.Rood) {
            basisR = 255
            basisG = 0
            basisB = 0
        } else if (kleur == TankjeKleur.Paars) {
            basisR = 160
            basisG = 0
            basisB = 255
        } else if (kleur == TankjeKleur.Blauw) {
            basisR = 0
            basisG = 80
            basisB = 255
        } else if (kleur == TankjeKleur.Groen) {
            basisR = 0
            basisG = 255
            basisB = 80
        } else if (kleur == TankjeKleur.Geel) {
            basisR = 255
            basisG = 180
            basisB = 0
        }
    }

    function dynamischeTint(r: number, g: number, b: number, helderheid: number, verschuiving: number): number {
        let tintR = Math.constrain(r + Math.round(Math.sin(verschuiving / 25) * 35), 0, 255)
        let tintG = Math.constrain(g + Math.round(Math.sin((verschuiving + 40) / 25) * 35), 0, 255)
        let tintB = Math.constrain(b + Math.round(Math.sin((verschuiving + 80) / 25) * 35), 0, 255)

        return neopixel.rgb(
            Math.idiv(tintR * helderheid, 255),
            Math.idiv(tintG * helderheid, 255),
            Math.idiv(tintB * helderheid, 255)
        )
    }

    /**
     * Zet de lampjes aan in een kleur
     */
    //% block="lampjes kleur %kleur"
    //% kleur.defl=TankjeKleur.Blauw
    //% weight=70
    export function lampjesAan(kleur: TankjeKleur): void {
        kiesLedKleur(kleur)
        ledAnimatieAan = true
    }

    /**
     * Zet de lampjes uit
     */
    //% block="lampjes uit"
    //% weight=69
    export function lampjesUit(): void {
        ledAnimatieAan = false
        strip.clear()
        strip.show()
    }

    /**
     * Meet de afstand met de ultrasone sensor
     */
    //% block="Afstand (cm)"
    //% weight=60
    export function afstandCm(): number {
        pins.digitalWritePin(trigPin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trigPin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trigPin, 0)

        let duur = pins.pulseIn(echoPin, PulseValue.High, 25000)

        if (duur == 0) {
            return 999
        }

        return Math.idiv(duur, 58)
    }

    /**
     * Rijdt vooruit tot er een obstakel dichtbij is
     */
    //% block="rijd tot obstakel dichterbij dan %afstand cm"
    //% afstand.defl=10
    //% weight=59
    export function rijdTotObstakel(afstand: number): void {
        while (afstandCm() > afstand) {
            vooruitZonderTimer()
            basic.pause(50)
        }

        stop()
    }

    control.inBackground(function () {
        let stap = 0

        while (true) {
            if (ledAnimatieAan) {
                for (let i = 0; i < 4; i++) {
                    let golf = Math.sin((stap + i * 45) / 30)
                    let helderheid = Math.round(80 + golf * 70)

                    strip.setPixelColor(i, dynamischeTint(
                        basisR,
                        basisG,
                        basisB,
                        helderheid,
                        stap + i * 60
                    ))
                }

                strip.show()
                stap += 2
            }

            basic.pause(60)
        }
    })
}