export interface ModelRegistryEntry {
  modelId: string;
  name: string;
  version: string;
  taskType: 'REGRESSION' | 'CLASSIFICATION' | 'OBJECT_DETECTION';
  algorithm: string;
  status: 'PRODUCTION' | 'STAGING' | 'DEPRECATED';
  trainedAt: string;
  metrics: Record<string, any>;
  inputSchema: string[];
  targetVariable?: string;
  datasetReference: string;
}

const MODEL_REGISTRY: ModelRegistryEntry[] = [
  {
    modelId: 'event-waste-rf-v1',
    name: 'Event Waste Regressor',
    version: 'v1.0.0',
    taskType: 'REGRESSION',
    algorithm: 'RandomForestRegressor (n_estimators=100)',
    status: 'PRODUCTION',
    trainedAt: '2026-08-15T10:00:00Z',
    metrics: {
      R2: 0.9238,
      MAE_kg: 1.67,
      RMSE_kg: 2.81,
      crossValScore: 0.912
    },
    inputSchema: [
      'guestCount', 'durationHours', 'eventType', 'foodType',
      'cateringType', 'storageConditions', 'purchaseHistory',
      'seasonality', 'location', 'pricing'
    ],
    targetVariable: 'Wastage Food Amount (kg)',
    datasetReference: 'Ecosetu-ML/01_Event_Waste_Prediction/event_waste_dataset.csv'
  },
  {
    modelId: 'waste-classifier-mlp-v1',
    name: 'Waste Image Classifier',
    version: 'v1.0.0',
    taskType: 'CLASSIFICATION',
    algorithm: 'StandardScaler + MLPClassifier (128, 64)',
    status: 'PRODUCTION',
    trainedAt: '2026-08-20T14:30:00Z',
    metrics: {
      accuracy: 0.5525,
      macroF1: 0.5517,
      classesCount: 8,
      realWasteAccuracy: 0.1646
    },
    inputSchema: ['image_rgb_32x32'],
    targetVariable: 'waste_category (battery, glass, metal, organic, paper, plastic, textiles, trash)',
    datasetReference: 'Ecosetu-ML/02_Waste_Classification/Garbage_Classification & RealWaste'
  },
  {
    modelId: 'waste-detector-rcnn-v1',
    name: 'Waste Object Detector',
    version: 'v1.0.0',
    taskType: 'OBJECT_DETECTION',
    algorithm: 'COCO Mask R-CNN & Linear Bounding Box Proposal',
    status: 'PRODUCTION',
    trainedAt: '2026-09-01T09:15:00Z',
    metrics: {
      mAP_50: 0.76,
      categoriesCount: 6,
      totalAnnotations: 2461
    },
    inputSchema: ['image_bounding_box_features'],
    targetVariable: 'detected_objects (biowaste, glass, household, metal, paper, plastic)',
    datasetReference: 'Ecosetu-ML/03_Waste_Detection/TACO_Annotations'
  }
];

export function getModelRegistry(): ModelRegistryEntry[] {
  return MODEL_REGISTRY;
}

export function getModelDetails(modelId: string): ModelRegistryEntry | undefined {
  return MODEL_REGISTRY.find(m => m.modelId === modelId);
}
