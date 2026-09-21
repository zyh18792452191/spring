'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText, Send } from 'lucide-react'

export default function DesignReviewPage() {
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [analysis])

  const startAnalysis = async () => {
    setIsLoading(true)
    setError('')
    setAnalysis('')

    try {
      const response = await fetch('/api/analyze/design-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: 'review' }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const text = decoder.decode(value, { stream: true })
        setAnalysis((prev) => prev + text)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAnalysis = (text: string) => {
    return text
      .replace(/###\s/g, '\n### ')
      .replace(/##\s/g, '\n## ')
      .replace(/#\s/g, '\n# ')
      .replace(/\n\n+/g, '\n\n')
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">设计方案评审</h1>
          <p className="text-gray-600">
            使用DeepSeek大模型重新评估报告关联配置的设计方案
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={startAnalysis}
            disabled={isLoading}
            className="bg-[#1D77FF] hover:bg-[#1565C0]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                开始分析
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              评审结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-medium">分析失败</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {isLoading && !analysis && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}

            <div
              ref={outputRef}
              className="prose prose-sm max-w-none overflow-auto max-h-[800px] bg-gray-50 rounded-lg p-4"
            >
              {analysis ? (
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {formatAnalysis(analysis)}
                </pre>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  点击"开始分析"按钮，DeepSeek大模型将重新评估设计方案
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
