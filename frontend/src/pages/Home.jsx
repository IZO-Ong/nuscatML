import { useEffect, useState } from 'react'
import { useCat } from '../context/CatContext'
import UploadForm from '../components/UploadForm'
import Preview from '../components/Preview'
import PredictSection from '../components/PredictSection'
import '../styles/Home.css'

export default function Home() {
  const {
    imagePreview,
    setImagePreview,
    prediction,
    setPrediction,
    loading,
    setLoading,
    lastPredictedCat,
    setLastPredictedCat
  } = useCat()

  const [pendingFile, setPendingFile] = useState(null)
  const [fadeReady, setFadeReady] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFadeReady(true)
    }, 10)
    return () => clearTimeout(timeout)
  }, [])

  const handlePredict = async () => {
    if (!pendingFile) return
    setLoading(true)
    setError(null)
    setPrediction(null)

    const formData = new FormData()
    formData.append('image', pendingFile)

    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      setPrediction(data.prediction)
      if (data.prediction.toLowerCase() !== 'not a cat') {
        setLastPredictedCat({ name: data.prediction, slug: data.slug })
      }
    } catch (err) {
      setPrediction(null)
      setLastPredictedCat(null)
      setError(err.message || 'Error fetching prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`main-box text-center fade-ready ${
        fadeReady ? 'fade-in' : ''
      }`}
    >
      <div className="card-inner">
        <h1 className="heading fade-delay-1">
          NUS Cat Classifier <span className="emoji">🐱</span>
        </h1>

        <div className="fade-delay-2">
          <UploadForm
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setPrediction={setPrediction}
            setLoading={setLoading}
            setPendingFile={(file) => {
              setPendingFile(file)
              setError(null)
              setPrediction(null)
            }}
          />
        </div>

        {imagePreview && (
          <>
            <div className="fade-delay-3">
              <Preview imagePreview={imagePreview} />
            </div>

            <div className="fade-delay-4">
              <PredictSection
                loading={loading}
                prediction={prediction}
                onPredict={handlePredict}
                disabled={!pendingFile}
                slug={lastPredictedCat?.slug}
                error={error}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
