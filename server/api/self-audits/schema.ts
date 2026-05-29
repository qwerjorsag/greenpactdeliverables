export type SelfAuditArea = "electricity" | "water" | "waste";

export const SELF_AUDIT_TABLES: Record<SelfAuditArea, string> = {
  electricity: "electricity_self_audits",
  water: "water_self_audits",
  waste: "waste_self_audits",
};

export const SELF_AUDIT_QUESTION_KEYS: Record<SelfAuditArea, readonly string[]> = {
  electricity: [
    "controls",
    "energy_audit",
    "led_lighting_replacement",
    "energy_saving_appliances",
    "hvac_maintenance",
    "use_renewable_energy_sources",
    "purchase_green_electricity",
    "building_energy_insulation",
    "employee_training_energy_behavior",
    "laundry_towels_on_request",
    "laundry_bed_linen_frequency",
    "lighting_motion_sensors_common_areas",
    "lighting_room_keycard_activators",
    "heating_standard_temperature_with_override",
    "ac_only_with_closed_windows",
    "guest_behavior_signs_turn_off",
    "guest_behavior_qr_flyer_info",
    "management_energy_monitoring_frequency",
    "management_record_temp_requests_for_prediction",
  ],
  water: [
    "water_leak_detection",
    "low_flow_fixtures",
    "linen_towel_reuse",
    "water_consumption_tracking",
  ],
  waste: [
    "waste_sorting_system",
    "food_waste_reduction",
    "single_use_reduction",
    "recycling_partner",
  ],
} as const;
