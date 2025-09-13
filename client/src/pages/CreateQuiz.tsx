import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';

interface Media {
  id: string;
  file: File;
  url: string;
  type: string;
  name: string;
  size: number;
}

interface Question {
  id: string;
  text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  order: number;
  media?: Media[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  share_code: string;
  user_id: string;
  cover_image?: Media;
}

const CreateQuiz = () => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    is_public: true
  });
  
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });
  
  const [createdQuiz, setCreatedQuiz] = useState<Quiz | null>(null);
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [quizCoverImage, setQuizCoverImage] = useState<Media | null>(null);
  const [currentQuestionMedia, setCurrentQuestionMedia] = useState<Media[]>([]);
  const toast = useRef<Toast>(null);

  const questionTypes = [
    { label: 'Multiple Choice', value: 'multiple_choice' },
    { label: 'True/False', value: 'true_false' },
    { label: 'Text', value: 'text' }
  ];

  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const allowedAudioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const uploadImageToImgBB = async (imageFile: File, apiKey: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
  
    try {

      const response = await fetch(`https://api.imgbb.com/1/upload?expiration=600&key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // {
    const sampleResponse = {
      "id": "My3HZpW9",
      "title": "Screenshot-from-2025-08-22-19-03-20",
      "url_viewer": "https://ibb.co/My3HZpW9",
      "url": "https://i.ibb.co/1YwN7Khb/Screenshot-from-2025-08-22-19-03-20.png",
      "display_url": "https://i.ibb.co/wZxqBC3Y/Screenshot-from-2025-08-22-19-03-20.png",
      "width": 1624,
      "height": 547,
      "size": 53194,
      "time": 1755954933,
      "expiration": 600,
      "image": {
          "filename": "Screenshot-from-2025-08-22-19-03-20.png",
          "name": "Screenshot-from-2025-08-22-19-03-20",
          "mime": "image/png",
          "extension": "png",
          "url": "https://i.ibb.co/1YwN7Khb/Screenshot-from-2025-08-22-19-03-20.png"
      },
      "thumb": {
          "filename": "Screenshot-from-2025-08-22-19-03-20.png",
          "name": "Screenshot-from-2025-08-22-19-03-20",
          "mime": "image/png",
          "extension": "png",
          "url": "https://i.ibb.co/My3HZpW9/Screenshot-from-2025-08-22-19-03-20.png"
      },
      "medium": {
          "filename": "Screenshot-from-2025-08-22-19-03-20.png",
          "name": "Screenshot-from-2025-08-22-19-03-20",
          "mime": "image/png",
          "extension": "png",
          "url": "https://i.ibb.co/wZxqBC3Y/Screenshot-from-2025-08-22-19-03-20.png"
      },
      "delete_url": "https://ibb.co/My3HZpW9/32e76836108cb06d21e4f6ddd5461fc9"
    }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Example usage
const handleImageUpload = async (file: File) => {
  try {
    const apiKey = '82bcca1958f7eb84a6e63d67d700bef1' //||import.meta.env.VITE_IMGBB_API_KEY; // Replace with your actual API key
    const result = await uploadImageToImgBB(file, apiKey);
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'File size must be less than 10MB',
        life: 3000
      });
      return false;
    }

    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedAudioTypes];
    if (!allowedTypes.includes(file.type)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'File type not supported. Please upload images, videos, or audio files.',
        life: 3000
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (files: FileList | null, isQuizCover: boolean = false): Promise<void> => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) return;

    const media: Media = {
      id: Date.now().toString(),
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: file.size
    };

    
    const response = await handleImageUpload(file);
    console.log('Upload successful:', response);

    if (isQuizCover) {
      setQuizCoverImage(media);
    } else {
      setCurrentQuestionMedia(prev => [...prev, media]);
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'File uploaded successfully!',
      life: 3000
    });
  };

  const removeMedia = (mediaId: string, isQuizCover: boolean = false): void => {
    if (isQuizCover) {
      if (quizCoverImage) {
        URL.revokeObjectURL(quizCoverImage.url);
        setQuizCoverImage(null);
      }
    } else {
      setCurrentQuestionMedia(prev => {
        const media = prev.find(m => m.id === mediaId);
        if (media) {
          URL.revokeObjectURL(media.url);
        }
        return prev.filter(m => m.id !== mediaId);
      });
    }
  };

  const MediaPreview = ({ media, onRemove, isQuizCover = false }: { 
    media: Media; 
    onRemove: () => void; 
    isQuizCover?: boolean;
  }) => {
    const isImage = allowedImageTypes.includes(media.type);
    const isVideo = allowedVideoTypes.includes(media.type);
    const isAudio = allowedAudioTypes.includes(media.type);

    return (
      <div className="relative border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{media.name}</span>
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-danger p-button-sm"
            onClick={onRemove}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {isImage && (
            <img 
              src={media.url} 
              alt={media.name}
              className={`${isQuizCover ? 'w-32 h-24' : 'w-20 h-16'} object-cover rounded`}
            />
          )}
          {isVideo && (
            <video 
              src={media.url} 
              controls
              className={`${isQuizCover ? 'w-32 h-24' : 'w-20 h-16'} rounded`}
            />
          )}
          {isAudio && (
            <audio 
              src={media.url} 
              controls
              className="w-full"
            />
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {(media.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
    );
  };

  const handleQuizSubmit = async () => {
    if (!quizData.title.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a quiz title',
        life: 3000
      });
      return;
    }

    try {
      // For demo purposes, using a mock user ID
      const mockUserId = 'a5140530-3ed6-4b97-ae3b-75c61744c7ad';
      
      const response = await axios.post('http://localhost:5000/api/quizzes', {
        ...quizData,
        user_id: mockUserId,
        cover_image: quizCoverImage ? {
          name: quizCoverImage.name,
          type: quizCoverImage.type,
          size: quizCoverImage.size
        } : null
      });

      const newQuiz = response.data;
      setCreatedQuiz(newQuiz);
      setShowShareInfo(true);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Quiz created successfully!',
        life: 3000
      });
      
      // Redirect to quiz list after a short delay
      // setTimeout(() => {
      //   navigate('/quizzes');
      // }, 2000);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create quiz. Please try again.',
        life: 3000
      });
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim() || !currentQuestion.correct_answer.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    if (currentQuestion.question_type === 'multiple_choice' && 
        currentQuestion.options.some(opt => !opt.trim())) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all options for multiple choice questions',
        life: 3000
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      ...currentQuestion,
      order: questions.length + 1,
      media: [...currentQuestionMedia]
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset current question form
    setCurrentQuestion({
      text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
    setCurrentQuestionMedia([]);

    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Question added successfully!',
      life: 3000
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const saveQuestionsToQuiz = async () => {
    if (!createdQuiz || questions.length === 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please create a quiz and add questions first',
        life: 3000
      });
      return;
    }

    try {
      for (const question of questions) {
        await axios.post(`http://localhost:5000/api/quizzes/${createdQuiz.id}/questions`, {
          text: question.text,
          question_type: question.question_type,
          options: question.question_type === 'multiple_choice' ? question.options : [],
          correct_answer: question.correct_answer,
          points: question.points,
          order: question.order,
          media: question.media?.map(m => ({
            name: m.name,
            type: m.type,
            size: m.size
          })) || []
        });
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'All questions saved to quiz!',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save questions. Please try again.',
        life: 3000
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toast ref={toast} />
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Quiz</h1>
        <p className="text-gray-600">Build an engaging quiz and share it with others!</p>
      </div>

      {/* Quiz Creation Form */}
      <Card className="shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title *
            </label>
            <InputText
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              placeholder="Enter quiz title"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <InputTextarea
              value={quizData.description}
              onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
              placeholder="Describe your quiz"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Quiz Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => await handleFileUpload(e.target.files, true)}
                className="hidden"
                id="quiz-cover-upload"
              />
              <label htmlFor="quiz-cover-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <i className="pi pi-image text-4xl text-gray-400"></i>
                  <p className="text-gray-600">Click to upload cover image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
            </div>
            {quizCoverImage && (
              <div className="mt-3">
                <MediaPreview 
                  media={quizCoverImage} 
                  onRemove={() => removeMedia(quizCoverImage.id, true)} 
                  isQuizCover={true}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              inputId="is_public"
              checked={quizData.is_public}
              onChange={(e) => setQuizData({ ...quizData, is_public: e.checked })}
            />
            <label htmlFor="is_public" className="text-sm text-gray-700">
              Make this quiz public
            </label>
          </div>

          <Button
            label="Create Quiz"
            icon="pi pi-check"
            onClick={handleQuizSubmit}
            className="w-full"
            disabled={!quizData.title.trim()}
          />
        </div>
      </Card>

      {/* Share Information */}
      {showShareInfo && createdQuiz && (
        <Card className="shadow-lg bg-green-50 border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              🎉 Quiz Created Successfully!
            </h3>
            <p className="text-green-700 mb-4">
              Share this code with others to let them take your quiz:
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-green-300">
              <code className="text-2xl font-mono font-bold text-green-600">
                {createdQuiz.share_code}
              </code>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Share URL: <span className="font-mono">http://localhost:3000/take/{createdQuiz.share_code}</span>
            </p>
          </div>
        </Card>
      )}

      {/* Question Creation Form */}
      {createdQuiz && (
        <Card className="shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Questions</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <InputTextarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Enter your question"
                rows={2}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <Dropdown
                  value={currentQuestion.question_type}
                  options={questionTypes}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_type: e.value })}
                  placeholder="Select question type"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <InputText
                  type="number"
                  value={currentQuestion.points.toString()}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                  className="w-full"
                />
              </div>
            </div>

            {/* Question Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Media (Images, Videos, Audio)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="question-media-upload"
                  multiple
                />
                <label htmlFor="question-media-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <i className="pi pi-upload text-3xl text-gray-400"></i>
                    <p className="text-gray-600">Click to upload media files</p>
                    <p className="text-sm text-gray-500">Images, videos, audio up to 10MB each</p>
                  </div>
                </label>
              </div>
              
              {/* Current Question Media Preview */}
              {currentQuestionMedia.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Media:</h4>
                  {currentQuestionMedia.map((media) => (
                    <MediaPreview 
                      key={media.id} 
                      media={media} 
                      onRemove={() => removeMedia(media.id)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {currentQuestion.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <InputText
                      key={index}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <InputText
                value={currentQuestion.correct_answer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                placeholder="Enter correct answer"
                className="w-full"
              />
            </div>

            <Button
              label="Add Question"
              icon="pi pi-plus"
              onClick={addQuestion}
              className="w-full"
              disabled={!currentQuestion.text.trim() || !currentQuestion.correct_answer.trim()}
            />
          </div>
        </Card>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <Card className="shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Questions ({questions.length})
          </h2>
          
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{question.text}</p>
                    <p className="text-sm text-gray-600">
                      Type: {question.question_type} | Points: {question.points}
                    </p>
                  </div>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-text"
                    onClick={() => removeQuestion(index)}
                  />
                </div>
                
                {/* Question Media Display */}
                {question.media && question.media.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Media:</p>
                    <div className="flex flex-wrap gap-2">
                      {question.media.map((media) => (
                        <div key={media.id} className="relative">
                          {allowedImageTypes.includes(media.type) && (
                            <img 
                              src={media.url} 
                              alt={media.name}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          {allowedVideoTypes.includes(media.type) && (
                            <video 
                              src={media.url} 
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          {allowedAudioTypes.includes(media.type) && (
                            <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                              <i className="pi pi-volume-up text-gray-600"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {createdQuiz && (
            <div className="mt-4 pt-4 border-t">
              <Button
                label="Save All Questions to Quiz"
                icon="pi pi-save"
                onClick={saveQuestionsToQuiz}
                className="w-full"
                severity="success"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CreateQuiz; 