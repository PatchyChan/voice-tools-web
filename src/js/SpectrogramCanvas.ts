import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import meyda from 'meyda'
import chroma from "chroma-js";
import {extremes, mean} from "@/js/Utils";
import Plotly from "plotly.js-dist-min";

/**
 * Convert power spectrum signal to decibel signal inspired by python's librosa library.
 *
 * @param ps Power spectrum
 * @param aMin
 * @param maxDb
 */
function powerToDb(ps: Float32Array[], aMin: number = 1e-10, maxDb: number = 80): Float32Array[]
{
    const ref = 1
    const refFactor = 10 * Math.log10(Math.max(aMin, ref))
    const out: Float32Array[] = []

    for (let amplitudes of ps)
    {
        const a = amplitudes.map(n => 10 * Math.log10(Math.min(n, aMin)) - refFactor)

        if (maxDb)
        {
            const min = extremes(a)[1] - maxDb
            for (let i in a) a[i] = Math.max(a[i], min)
        }
    }

    return out
}

/**
 * Calculate fft spectrogram
 *
 * (Please set meyda.sampleRate before calling this)
 *
 * @param data Decoded audio waveform data
 * @param hopLen Hop length
 * @param winLen Window length (aka. n_fft)
 */
function spectrogram(data: Float32Array, hopLen: number = 512, winLen: number = 2048): Float32Array[]
{
    const l = data.length
    console.log(l / hopLen);
    const out = []

    meyda.bufferSize = winLen
    let previous = data.subarray(0, winLen)

    // Loop through windows
    for (let i = 0; i < l - winLen; i += hopLen)
    {
        // Get window subarray
        const win = data.subarray(i, i + winLen)

        // Compute FFT
        const fft = meyda.extract(['powerSpectrum'], win, previous)!.powerSpectrum!
        out.push(fft)

        previous = win
    }

    return out
}

export default class SpectrogramCanvas extends CanvasController
{
    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     * @param audioCtx
     */
    async drawAudio(audio: AudioBuffer, audioCtx: AudioContext)
    {
        meyda.sampleRate = 16000
        meyda.bufferSize = 2048
        // const d = meyda.extract(['amplitudeSpectrum'], audio.getChannelData(0).subarray(0, 2048))!.amplitudeSpectrum!
        const spec = spectrogram(audio.getChannelData(0))

        await Plotly.newPlot('ft', [{y: spec[0]}],
                {height: 300, margin: {t: 0, b: 20, l: 10, r: 0}})

        this.el.width = this.w = spec.length
        // const xPxLen = d.length / this.w

        console.log(spec);
        const [min, max] = extremes(spec.flatMap(it => extremes(it)))
        const range = max - min

        console.log(min, max)

        for (let x = 0; x < this.w; x++)
        {
            const d = spec[x]

            // this.el.height = this.h = d.length
            const pxLen = d.length / this.h

            const gradient = chroma.scale(['#000',
                '#4F1879', '#B43A78', '#F98766', '#FCFAC0']);

            for (let y = 0; y < this.h; y++)
            {
                const area = d.subarray(y * pxLen, (y + 1) * pxLen)

                this.ctx.beginPath()
                this.ctx.strokeStyle = gradient((mean(area) - min) / range).toString()
                this.ctx.moveTo(x, this.h - y)
                this.ctx.lineTo(x + 1, this.h - y)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }
}