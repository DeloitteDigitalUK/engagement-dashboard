import React from 'react';
import { UpdateTypes } from 'models';

function InsightsSummary() {

}

function InsightsView() {

}

function InsightsForm() {

}

export const updateType = UpdateTypes.insights;
export const summaryCriteria = () => ({
  orderBy: ['date', 'desc'],
  limit: 3,
});
export const summaryView = InsightsSummary;
export const fullView = InsightsView;
export const addForm = InsightsForm;
export const editForm = InsightsForm;
